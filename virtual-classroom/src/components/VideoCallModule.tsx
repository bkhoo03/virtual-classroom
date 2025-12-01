import { useState, useEffect, useCallback, useRef } from 'react';
import { VideoCallService } from '../services/VideoCallService';
import VideoPlayer from './VideoPlayer';
import ConnectionQualityIndicator from './ConnectionQualityIndicator';
import ReconnectionNotification from './ReconnectionNotification';
import { useToast } from '../contexts/ToastContext';
import { useStateChangeAnnouncement } from '../hooks/useScreenReaderAnnouncement';
import type { VideoStream } from '../types/video.types';
import type { ConnectionQuality } from '../types';

interface VideoCallModuleProps {
  sessionId: string;
  userId: string;
  userName: string;
  userRole: 'tutor' | 'tutee';
  onConnectionChange?: (status: { state: string; quality: ConnectionQuality }) => void;
  onAudioChange?: (muted: boolean) => void;
  onVideoChange?: (off: boolean) => void;
  externalAudioMuted?: boolean;
  externalVideoOff?: boolean;
  isChatCollapsed?: boolean;
}

export default function VideoCallModule({
  sessionId,
  userId,
  userName,
  userRole,
  onConnectionChange,
  onAudioChange,
  onVideoChange,
  externalAudioMuted,
  externalVideoOff,
  isChatCollapsed = false
}: VideoCallModuleProps) {
  const { showToast } = useToast();
  const [videoService] = useState(() => new VideoCallService());
  const [localStream, setLocalStream] = useState<VideoStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, VideoStream>>(new Map());
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>('good');
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasJoinedCall, setHasJoinedCall] = useState(false); // Track if user has actually joined
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const lastQualityRef = useRef<ConnectionQuality>('good');
  const lastQualityWarningRef = useRef<ConnectionQuality | null>(null);

  // Screen reader announcements for state changes
  useStateChangeAnnouncement(
    isAudioMuted,
    (muted) => muted ? 'Microphone muted' : 'Microphone unmuted',
    'polite'
  );

  useStateChangeAnnouncement(
    isVideoEnabled,
    (enabled) => enabled ? 'Camera turned on' : 'Camera turned off',
    'polite'
  );

  useStateChangeAnnouncement(
    connectionQuality,
    (quality) => {
      if (quality === 'poor' || quality === 'bad') {
        return `Connection quality ${quality}`;
      }
      return null; // Don't announce good/excellent quality
    },
    'assertive'
  );

  useStateChangeAnnouncement(
    isReconnecting,
    (reconnecting) => reconnecting ? 'Reconnecting to video call' : 'Reconnected to video call',
    'assertive'
  );

  const handleReconnectStateChange = useCallback((reconnecting: boolean, attempt: number) => {
    setIsReconnecting(reconnecting);
    setReconnectAttempt(attempt);
  }, []);

  const handleManualReconnect = useCallback(async () => {
    await videoService.manualReconnect();
  }, [videoService]);

  const initializeVideoCall = useCallback(async () => {
    try {
      setConnectionError(null);
      setPermissionError(null);

      const appId = import.meta.env.VITE_AGORA_APP_ID;
      if (!appId) {
        const error = 'Agora App ID not configured';
        console.error(error);
        setConnectionError(error);
        showToast('Video call configuration error. Please contact support.', 'error');
        return;
      }

      // Generate token
      try {
        const tokenData = await videoService.generateToken(sessionId, userId, 'publisher');

        // Initialize the service with reconnection callback
        await videoService.initialize(
          {
            appId,
            channel: sessionId,
            token: tokenData.token || null,
            uid: tokenData.uid,
            userId,
            userName
          },
          handleReconnectStateChange
        );
      } catch (error: any) {
        // Ignore "already connected" errors
        if (error?.code === 'INVALID_OPERATION' && error?.message?.includes('already in connecting/connected state')) {
          console.log('Already connected, continuing...');
          return;
        }
        
        const errorMessage = error instanceof Error ? error.message : 'Failed to connect to video service';
        console.error('Connection error:', error);
        setConnectionError(errorMessage);
        showToast('Failed to connect to video call. Please check your internet connection.', 'error');
        return;
      }

      // Create and publish local tracks
      try {
        const localVideoStream = await videoService.createLocalTracks();
        setLocalStream(localVideoStream);
        setHasJoinedCall(true); // Mark as joined when tracks are created
        console.log('✅ User has joined the call, hasJoinedCall=true');
        showToast('Video call connected successfully', 'success', 3000);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to access media devices';
        console.error('Media device error:', error);
        setPermissionError(errorMessage);
        
        // Check if it's a permission error
        if (errorMessage.includes('Permission') || errorMessage.includes('NotAllowedError')) {
          showToast('Camera or microphone access denied. Please grant permissions in your browser settings.', 'error', 7000);
        } else if (errorMessage.includes('NotFoundError')) {
          showToast('No camera or microphone found. Please connect a device and try again.', 'error', 7000);
        } else {
          showToast('Failed to access camera or microphone. Please check your device settings.', 'error', 7000);
        }
        return;
      }

      // Set up remote user handling
      const client = videoService.getClient();
      if (client) {
        // Subscribe to existing remote users who are already in the channel
        console.log('Checking for existing remote users...');
        const existingUsers = client.remoteUsers;
        console.log(`Found ${existingUsers.length} existing remote users`);
        for (const user of existingUsers) {
          if (user.hasVideo || user.hasAudio) {
            console.log('Subscribing to existing user:', user.uid);
            const remoteStream = await videoService.subscribeToRemoteUser(user.uid);
            if (remoteStream) {
              setRemoteStreams(prev => {
                const newMap = new Map(prev);
                newMap.set(String(user.uid), remoteStream);
                return newMap;
              });
            }
          }
        }

        client.on('user-published', async (user, mediaType) => {
          console.log(`📡 Remote user published ${mediaType}:`, user.uid);
          const remoteStream = await videoService.subscribeToRemoteUser(user.uid);
          if (remoteStream) {
            setRemoteStreams(prev => {
              const newMap = new Map(prev);
              const existingStream = newMap.get(String(user.uid));
              
              // If user already exists, just update their tracks
              if (existingStream) {
                console.log(`🔄 Updating existing user ${user.uid} with new ${mediaType} track`);
              } else {
                console.log(`✅ Adding new user ${user.uid} to remote streams`);
                showToast('Participant joined the call', 'info', 3000);
              }
              
              newMap.set(String(user.uid), remoteStream);
              return newMap;
            });
          }
        });

        client.on('user-unpublished', (user, mediaType) => {
          console.log(`📴 Remote user unpublished ${mediaType}:`, user.uid);
          
          // DON'T remove the user from remoteStreams when they unpublish
          // They're just muting their mic or turning off their camera
          // Only remove them when they actually leave (user-left event)
          
          // Update the stream to reflect the unpublished track
          setRemoteStreams(prev => {
            const newMap = new Map(prev);
            const existingStream = newMap.get(String(user.uid));
            
            if (existingStream) {
              // Update the stream with current track states
              const updatedStream = {
                ...existingStream,
                videoTrack: mediaType === 'video' ? null : existingStream.videoTrack,
                audioTrack: mediaType === 'audio' ? null : existingStream.audioTrack
              };
              
              // Only keep the user if they still have at least one track
              // or if they're still in the channel (check remoteUsers)
              const remoteUser = client.remoteUsers.find(u => u.uid === user.uid);
              if (remoteUser) {
                console.log(`🔄 User ${user.uid} still in channel, keeping in remote streams`);
                newMap.set(String(user.uid), updatedStream);
              } else {
                console.log(`❌ User ${user.uid} not in channel, removing from remote streams`);
                newMap.delete(String(user.uid));
              }
            }
            
            return newMap;
          });
        });

        client.on('user-left', (user) => {
          console.log('Remote user left:', user.uid);
          setRemoteStreams(prev => {
            const newMap = new Map(prev);
            newMap.delete(String(user.uid));
            return newMap;
          });
          showToast('Participant left the call', 'info', 3000);
        });

        client.on('connection-state-change', (curState, prevState) => {
          console.log('Connection state changed:', prevState, '->', curState);
          if (curState === 'DISCONNECTED') {
            setConnectionError('Connection lost');
            showToast('Connection lost. Attempting to reconnect...', 'warning');
          } else if (curState === 'CONNECTED' && prevState === 'RECONNECTING') {
            setConnectionError(null);
            showToast('Reconnected successfully', 'success', 3000);
          }
        });
      }

      setIsInitialized(true);
      console.log('Video call initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Failed to initialize video call:', error);
      setConnectionError(errorMessage);
      showToast('Failed to initialize video call. Please try again.', 'error');
    }
  }, [sessionId, userId, userName, videoService, handleReconnectStateChange, showToast]);

  useEffect(() => {
    initializeVideoCall();

    // Cleanup on unmount
    return () => {
      videoService.cleanup();
    };
  }, [initializeVideoCall, videoService]);

  // Monitor connection quality and adjust video quality automatically
  useEffect(() => {
    if (!isInitialized) return;

    const interval = setInterval(async () => {
      const quality = videoService.getNetworkQuality();
      setConnectionQuality(quality);
      
      // Automatically adjust video quality if it changed significantly
      if (quality !== lastQualityRef.current) {
        console.log(`Connection quality changed: ${lastQualityRef.current} -> ${quality}`);
        await videoService.adjustVideoQuality(quality);
        lastQualityRef.current = quality;
      }

      // Show warning for poor connection quality (only once per quality level)
      if ((quality === 'poor' || quality === 'bad') && quality !== lastQualityWarningRef.current) {
        lastQualityWarningRef.current = quality;
        if (quality === 'bad') {
          showToast('Network quality is very poor. Video quality has been reduced.', 'warning', 5000);
        } else if (quality === 'poor') {
          showToast('Network quality is degraded. Video quality adjusted.', 'warning', 4000);
        }
      } else if (quality === 'good' || quality === 'excellent') {
        // Reset warning ref when quality improves
        if (lastQualityWarningRef.current !== null) {
          lastQualityWarningRef.current = null;
        }
      }
      
      if (onConnectionChange) {
        onConnectionChange({
          state: 'connected',
          quality
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isInitialized, videoService, onConnectionChange, showToast]);

  const handleToggleAudio = useCallback(async (muted: boolean) => {
    try {
      console.log(`🎤 Toggling audio: ${muted ? 'MUTED' : 'UNMUTED'}`);
      await videoService.toggleAudio(muted);
      // Update local state after successful toggle
      setIsAudioMuted(muted);
      console.log(`✅ Audio toggled successfully, isAudioMuted=${muted}`);
      // Notify parent of audio state change
      if (onAudioChange) {
        onAudioChange(muted);
      }
    } catch (error) {
      console.error('Failed to toggle audio:', error);
      showToast('Failed to toggle microphone', 'error');
    }
  }, [videoService, onAudioChange, showToast]);

  const handleToggleVideo = useCallback(async (enabled: boolean) => {
    try {
      console.log(`📹 Toggling video: ${enabled ? 'ON' : 'OFF'}`);
      await videoService.toggleVideo(enabled);
      // Update local state after successful toggle
      setIsVideoEnabled(enabled);
      console.log(`✅ Video toggled successfully, isVideoEnabled=${enabled}`);
      // Notify parent of video state change
      if (onVideoChange) {
        onVideoChange(!enabled);
      }
    } catch (error) {
      console.error('Failed to toggle video:', error);
      showToast('Failed to toggle camera', 'error');
    }
  }, [videoService, onVideoChange, showToast]);

  // Sync with external control changes (from toolbar)
  // Only update if the external state differs from current state
  useEffect(() => {
    if (externalAudioMuted !== undefined && externalAudioMuted !== isAudioMuted) {
      handleToggleAudio(externalAudioMuted);
    }
  }, [externalAudioMuted, isAudioMuted, handleToggleAudio]);

  useEffect(() => {
    if (externalVideoOff !== undefined && externalVideoOff !== !isVideoEnabled) {
      handleToggleVideo(!externalVideoOff);
    }
  }, [externalVideoOff, isVideoEnabled, handleToggleVideo]);

  // Sync initial state after tracks are created
  useEffect(() => {
    if (!isInitialized || !localStream) return;

    // Only sync once when tracks are first created
    const mediaState = videoService.getMediaState();
    console.log('Initial media state sync:', mediaState);
    
    setIsAudioMuted(mediaState.audioMuted);
    setIsVideoEnabled(mediaState.videoEnabled);
    
    if (onAudioChange) {
      onAudioChange(mediaState.audioMuted);
    }
    if (onVideoChange) {
      onVideoChange(!mediaState.videoEnabled);
    }
  }, [isInitialized, localStream]); // Only run when initialized and tracks are created

  // Debug: Log hasJoinedCall state changes
  useEffect(() => {
    console.log(`🔄 hasJoinedCall changed to: ${hasJoinedCall}`);
  }, [hasJoinedCall]);

  return (
    <>
      {/* Reconnection notification */}
      <ReconnectionNotification
        isReconnecting={isReconnecting}
        reconnectAttempt={reconnectAttempt}
        maxAttempts={3}
        onManualReconnect={handleManualReconnect}
      />

      {/* Connection Error Banner - Light theme */}
      {connectionError && !isReconnecting && (
        <div className="fixed bottom-32 right-4 z-40 w-80">
          <div className="bg-red-50 border border-red-200 text-red-900 rounded-lg shadow-lg p-4 flex items-start gap-3">
            <svg className="w-6 h-6 flex-shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">Connection Failed</p>
              <p className="text-xs mt-1 text-red-700">{connectionError}</p>
            </div>
            <button
              onClick={handleManualReconnect}
              className="flex-shrink-0 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Permission Error Banner - Light theme */}
      {permissionError && (
        <div className="fixed bottom-32 right-4 z-40 w-80">
          <div className="bg-orange-50 border border-orange-200 text-orange-900 rounded-lg shadow-lg p-4 flex items-start gap-3">
            <svg className="w-6 h-6 flex-shrink-0 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-900">Camera/Microphone Access Required</p>
              <p className="text-xs mt-1 text-orange-700">Please grant permissions in your browser settings and refresh the page.</p>
            </div>
            <button
              onClick={() => setPermissionError(null)}
              className="flex-shrink-0 text-orange-600 hover:text-orange-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Video content area - No standalone header, designed for tab integration */}
      <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
        <div className={`flex-1 flex gap-4 p-4 overflow-hidden transition-all duration-500 ${isChatCollapsed ? 'flex-col' : 'flex-row'}`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
        >
          {/* Tutee Video - Modern glass styling */}
          <div className={`relative bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl overflow-hidden border border-gray-200/50 shadow-lg transition-all duration-500 ${isChatCollapsed ? 'flex-1 min-h-[200px]' : 'flex-1'}`}
            style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            {userRole === 'tutee' && hasJoinedCall ? (
              <VideoPlayer
                videoTrack={localStream?.videoTrack || null}
                userName={userName}
                isLocal={true}
                connectionQuality={connectionQuality}
                audioMuted={isAudioMuted}
                videoOff={!isVideoEnabled}
              />
            ) : remoteStreams.size > 0 && userRole === 'tutor' ? (
              (() => {
                const remoteStream = Array.from(remoteStreams.values())[0];
                return (
                  <VideoPlayer
                    videoTrack={remoteStream.videoTrack}
                    userName="Tutee"
                    isLocal={false}
                    connectionQuality={connectionQuality}
                    videoOff={!remoteStream.videoTrack}
                  />
                );
              })()
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-100 animate-fade-in">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mb-3 shadow-lg animate-scale-in">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-gray-700 text-sm font-medium">Student</p>
                <p className="text-gray-500 text-xs mt-1">
                  {userRole === 'tutee' ? 'Connecting...' : 'Waiting to join...'}
                </p>
              </div>
            )}
            {/* Glass overlay for user info - only show when joined */}
            {(userRole === 'tutee' && hasJoinedCall) || (userRole === 'tutor' && remoteStreams.size > 0) ? (
              <div className="absolute top-3 left-3 glass-dark px-3 py-2 rounded-xl shadow-lg border border-white/10 animate-fade-in">
                <span className="text-white text-xs font-medium">👨‍🎓 Student</span>
              </div>
            ) : null}
            {/* Glass overlay for connection quality - only show when joined */}
            {userRole === 'tutee' && hasJoinedCall && (
              <div className="absolute top-3 right-3 glass-dark px-2.5 py-2 rounded-xl shadow-lg border border-white/10 animate-fade-in">
                <ConnectionQualityIndicator quality={connectionQuality} showLabel={false} />
              </div>
            )}
          </div>

          {/* Tutor Video - Modern glass styling */}
          <div className={`relative bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl overflow-hidden border border-gray-200/50 shadow-lg transition-all duration-500 ${isChatCollapsed ? 'flex-1 min-h-[200px]' : 'flex-1'}`}
            style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            {userRole === 'tutor' && hasJoinedCall ? (
              <VideoPlayer
                videoTrack={localStream?.videoTrack || null}
                userName={userName}
                isLocal={true}
                connectionQuality={connectionQuality}
                audioMuted={isAudioMuted}
                videoOff={!isVideoEnabled}
              />
            ) : remoteStreams.size > 0 && userRole === 'tutee' ? (
              (() => {
                const remoteStream = Array.from(remoteStreams.values())[0];
                return (
                  <VideoPlayer
                    videoTrack={remoteStream.videoTrack}
                    userName="Tutor"
                    isLocal={false}
                    connectionQuality={connectionQuality}
                    videoOff={!remoteStream.videoTrack}
                  />
                );
              })()
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 animate-fade-in">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-500 rounded-full flex items-center justify-center mb-3 shadow-lg animate-scale-in">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-gray-700 text-sm font-medium">Tutor</p>
                <p className="text-gray-500 text-xs mt-1">
                  {userRole === 'tutor' ? 'Connecting...' : 'Waiting to join...'}
                </p>
              </div>
            )}
            {/* Glass overlay for user info - only show when joined */}
            {(userRole === 'tutor' && hasJoinedCall) || (userRole === 'tutee' && remoteStreams.size > 0) ? (
              <div className="absolute top-3 left-3 glass-dark px-3 py-2 rounded-xl shadow-lg border border-white/10 animate-fade-in">
                <span className="text-white text-xs font-medium">👨‍🏫 Tutor</span>
              </div>
            ) : null}
            {/* Glass overlay for connection quality - only show when joined */}
            {userRole === 'tutor' && hasJoinedCall && (
              <div className="absolute top-3 right-3 glass-dark px-2.5 py-2 rounded-xl shadow-lg border border-white/10 animate-fade-in">
                <ConnectionQualityIndicator quality={connectionQuality} showLabel={false} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
