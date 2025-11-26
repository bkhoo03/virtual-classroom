import { useCallback, useEffect, useRef } from 'react';
import { useClassroomContext } from '../contexts/ClassroomContext';
import { VideoCallService } from '../services/VideoCallService';
import type { VideoStream, VideoCallConfig } from '../types/video.types';
import type { ConnectionStatus } from '../types';

/**
 * Custom hook for managing video call state and operations
 */
export function useVideo() {
  const { state, dispatch } = useClassroomContext();
  const videoServiceRef = useRef<VideoCallService | null>(null);

  // Initialize video service
  useEffect(() => {
    if (!videoServiceRef.current) {
      videoServiceRef.current = new VideoCallService();
    }

    return () => {
      // Cleanup on unmount
      if (videoServiceRef.current) {
        videoServiceRef.current.cleanup();
        videoServiceRef.current = null;
      }
    };
  }, []);

  /**
   * Initialize and join video call
   */
  const joinCall = useCallback(async (config: VideoCallConfig) => {
    if (!videoServiceRef.current) {
      throw new Error('Video service not initialized');
    }

    try {
      // Update connection status
      dispatch({
        type: 'UPDATE_CONNECTION_STATUS',
        payload: { state: 'connecting', quality: 'good' }
      });

      // Store config
      dispatch({ type: 'SET_VIDEO_CONFIG', payload: config });

      // Initialize video service with reconnection callback
      await videoServiceRef.current.initialize(config, (isReconnecting, attempts) => {
        dispatch({
          type: 'SET_RECONNECTING',
          payload: { isReconnecting, attempts }
        });
      });

      // Create and publish local tracks
      const localStream = await videoServiceRef.current.createLocalTracks();
      dispatch({ type: 'SET_LOCAL_STREAM', payload: localStream });

      // Update connection status
      dispatch({
        type: 'UPDATE_CONNECTION_STATUS',
        payload: { state: 'connected', quality: 'good' }
      });

      // Set up remote user subscription
      const client = videoServiceRef.current.getClient();
      if (client) {
        client.on('user-published', async (user, mediaType) => {
          console.log('User published:', user.uid, mediaType);
          const remoteStream = await videoServiceRef.current?.subscribeToRemoteUser(user.uid);
          if (remoteStream) {
            dispatch({ type: 'ADD_REMOTE_STREAM', payload: remoteStream });
          }
        });

        client.on('user-unpublished', (user) => {
          console.log('User unpublished:', user.uid);
          dispatch({ type: 'REMOVE_REMOTE_STREAM', payload: String(user.uid) });
        });

        client.on('user-left', (user) => {
          console.log('User left:', user.uid);
          dispatch({ type: 'REMOVE_REMOTE_STREAM', payload: String(user.uid) });
        });
      }

      // Start monitoring network quality
      startQualityMonitoring();
    } catch (error) {
      console.error('Failed to join call:', error);
      dispatch({
        type: 'UPDATE_CONNECTION_STATUS',
        payload: { state: 'disconnected', quality: 'bad' }
      });
      throw error;
    }
  }, [dispatch]);

  /**
   * Leave the video call
   */
  const leaveCall = useCallback(async () => {
    if (!videoServiceRef.current) return;

    try {
      await videoServiceRef.current.cleanup();
      
      // Clear state
      dispatch({ type: 'SET_LOCAL_STREAM', payload: null });
      dispatch({
        type: 'UPDATE_CONNECTION_STATUS',
        payload: { state: 'disconnected', quality: 'good' }
      });
      
      // Clear remote streams
      state.video.remoteStreams.forEach((_, userId) => {
        dispatch({ type: 'REMOVE_REMOTE_STREAM', payload: userId });
      });
    } catch (error) {
      console.error('Error leaving call:', error);
    }
  }, [dispatch, state.video.remoteStreams]);

  /**
   * Toggle audio mute state
   */
  const toggleAudio = useCallback(async () => {
    if (!videoServiceRef.current) return;

    const newMutedState = !state.video.isAudioMuted;
    try {
      await videoServiceRef.current.toggleAudio(newMutedState);
      dispatch({ type: 'TOGGLE_AUDIO', payload: newMutedState });
    } catch (error) {
      console.error('Error toggling audio:', error);
    }
  }, [state.video.isAudioMuted, dispatch]);

  /**
   * Toggle video on/off state
   */
  const toggleVideo = useCallback(async () => {
    if (!videoServiceRef.current) return;

    const newVideoState = !state.video.isVideoOff;
    try {
      await videoServiceRef.current.toggleVideo(!newVideoState);
      dispatch({ type: 'TOGGLE_VIDEO', payload: newVideoState });
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  }, [state.video.isVideoOff, dispatch]);

  /**
   * Manually trigger reconnection
   */
  const reconnect = useCallback(async () => {
    if (!videoServiceRef.current) return;

    try {
      await videoServiceRef.current.manualReconnect();
    } catch (error) {
      console.error('Manual reconnection failed:', error);
    }
  }, []);

  /**
   * Start monitoring network quality
   */
  const startQualityMonitoring = useCallback(() => {
    const monitorInterval = setInterval(() => {
      if (!videoServiceRef.current) {
        clearInterval(monitorInterval);
        return;
      }

      const quality = videoServiceRef.current.getNetworkQuality();
      
      // Update connection status if quality changed
      if (quality !== state.video.connectionStatus.quality) {
        dispatch({
          type: 'UPDATE_CONNECTION_STATUS',
          payload: {
            state: state.video.connectionStatus.state,
            quality
          }
        });

        // Adjust video quality based on network conditions
        videoServiceRef.current.adjustVideoQuality(quality);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(monitorInterval);
  }, [state.video.connectionStatus, dispatch]);

  /**
   * Generate Agora token
   */
  const generateToken = useCallback(async (
    channel: string,
    userId: string,
    role: 'publisher' | 'subscriber' = 'publisher'
  ) => {
    if (!videoServiceRef.current) {
      throw new Error('Video service not initialized');
    }

    return await videoServiceRef.current.generateToken(channel, userId, role);
  }, []);

  return {
    // State
    localStream: state.video.localStream,
    remoteStreams: state.video.remoteStreams,
    connectionStatus: state.video.connectionStatus,
    isAudioMuted: state.video.isAudioMuted,
    isVideoOff: state.video.isVideoOff,
    isReconnecting: state.video.isReconnecting,
    reconnectAttempts: state.video.reconnectAttempts,
    config: state.video.config,

    // Actions
    joinCall,
    leaveCall,
    toggleAudio,
    toggleVideo,
    reconnect,
    generateToken
  };
}
