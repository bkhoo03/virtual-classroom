import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef, lazy, Suspense } from 'react';
import ClassroomLayout from '../layouts/ClassroomLayout';
import { ControlToolbar } from '../components';
import { VideoCallSkeleton, PresentationSkeleton, ChatSkeleton } from '../components/skeletons';
import { useClassroomControls } from '../hooks/useClassroomControls';
import { useAuth } from '../contexts/AuthContext';
import SessionSecurityService from '../services/SessionSecurityService';
import SessionCleanupService from '../services/SessionCleanupService';
import { PageTransition } from '../components/PageTransition';

// Lazy load heavy components
const VideoCallModule = lazy(() => import('../components/VideoCallModule'));
const PresentationPanel = lazy(() => import('../components/PresentationPanel'));
const Chat = lazy(() => import('../components/Chat'));
const AIOutputPanel = lazy(() => import('../components/AIOutputPanel'));

export default function ClassroomPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  // Video control states - synced between VideoCallModule and ControlToolbar
  const [videoAudioMuted, setVideoAudioMuted] = useState(false);
  const [videoVideoOff, setVideoVideoOff] = useState(false);
  
  // Track if we're currently updating from toolbar to prevent loops
  const isUpdatingFromToolbar = useRef(false);
  
  // Get user data from auth context
  const userId = authState.user?.id || '';
  const userName = authState.user?.name || '';
  const userRole = authState.user?.role || 'tutee';

  useEffect(() => {
    // Validate session ID format
    if (!sessionId || sessionId.length < 8) {
      setError('Invalid session ID');
      setIsLoading(false);
      return;
    }

    // For now, allow direct access to any session
    // Session will be created on-demand when user joins
    const initializeSession = async () => {
      try {
        // Try to validate session, but don't fail if it doesn't exist yet
        try {
          const validation = await SessionSecurityService.validateSessionAccess(sessionId);
          if (!validation.valid) {
            // Session doesn't exist yet, create it
            console.log('Session does not exist, will be created on join');
          }
        } catch (err) {
          // Session validation failed, but that's okay - it will be created
          console.log('Session will be created on join');
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Session initialization error:', err);
        // Don't show error, allow user to proceed
        setIsLoading(false);
      }
    };

    initializeSession();
  }, [sessionId, userId]);

  const handleLeaveClassroom = useCallback(async () => {
    try {
      // Cleanup will be handled by useSessionCleanup hook
      await SessionCleanupService.cleanupSession(
        sessionId || '',
        null, // Video service would be passed from context
        null  // Whiteboard service would be passed from context
      );
    } catch (error) {
      console.error('Error leaving classroom:', error);
    } finally {
      navigate('/');
    }
  }, [navigate, sessionId]);

  const handleToggleScreenShare = useCallback(() => {
    setIsScreenSharing((prev) => !prev);
    // TODO: Implement actual screen share logic
  }, []);

  const handleChangePresentationMode = useCallback((mode: 'pdf' | 'screenshare' | 'whiteboard') => {
    console.log('Changing presentation mode to:', mode);
    // The mode change is handled by the PresentationModeManager
    // This is called from ControlToolbar, but the actual mode switching
    // happens via TopToolbar in PresentationPanel
  }, []);

  // Callbacks to sync video control states from VideoCallModule
  const handleVideoAudioChange = useCallback((muted: boolean) => {
    setVideoAudioMuted(muted);
  }, []);

  const handleVideoVideoChange = useCallback((off: boolean) => {
    setVideoVideoOff(off);
  }, []);

  // Set up keyboard shortcuts and get control state
  const {
    presentationMode,
  } = useClassroomControls({
    onLeaveClassroom: handleLeaveClassroom,
    onToggleScreenShare: handleToggleScreenShare,
    onChangePresentationMode: handleChangePresentationMode,
  });

  // Toolbar toggle functions - directly toggle the video state
  const handleToolbarToggleAudio = useCallback(() => {
    setVideoAudioMuted(prev => !prev);
  }, []);

  const handleToolbarToggleVideo = useCallback(() => {
    setVideoVideoOff(prev => !prev);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#5C0099] border-t-[#FDC500] mb-4"></div>
          <p className="text-gray-700 text-lg">Joining classroom...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-[#03071E] mb-2">Unable to Join</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-[#5C0099] text-white rounded-lg hover:bg-[#C86BFA] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <ClassroomLayout
        chatPanel={
          <Suspense fallback={<ChatSkeleton />}>
            <Chat sessionId={sessionId} />
          </Suspense>
        }
        aiOutputPanel={
          <Suspense fallback={<div className="h-full flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div></div>}>
            <AIOutputPanel 
              sessionId={sessionId || ''} 
              role={userRole as 'tutor' | 'tutee'} 
            />
          </Suspense>
        }
        videoModule={
          <Suspense fallback={<VideoCallSkeleton />}>
            <VideoCallModule
              sessionId={sessionId || ''}
              userId={userId}
              userName={userName}
              userRole={userRole}
              onAudioChange={handleVideoAudioChange}
              onVideoChange={handleVideoVideoChange}
              externalAudioMuted={videoAudioMuted}
              externalVideoOff={videoVideoOff}
            />
          </Suspense>
        }
        presentationPanel={
          <Suspense fallback={<PresentationSkeleton />}>
            <PresentationPanel 
              sessionId={sessionId}
              userId={userId}
              userRole={userRole as 'tutor' | 'tutee'}
            />
          </Suspense>
        }
      />
      
      {/* Control Toolbar - floating at bottom center, synced with video controls */}
      <ControlToolbar
        isAudioMuted={videoAudioMuted}
        isVideoOff={videoVideoOff}
        onToggleAudio={handleToolbarToggleAudio}
        onToggleVideo={handleToolbarToggleVideo}
        isScreenSharing={isScreenSharing}
        onToggleScreenShare={handleToggleScreenShare}
        presentationMode={presentationMode === 'ai-output' ? undefined : presentationMode as 'pdf' | 'screenshare' | 'whiteboard'}
        onChangePresentationMode={handleChangePresentationMode}
        onLeaveClassroom={handleLeaveClassroom}
      />
    </PageTransition>
  );
}
