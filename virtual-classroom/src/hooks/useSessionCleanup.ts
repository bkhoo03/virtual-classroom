import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SessionCleanupService from '../services/SessionCleanupService';
import { VideoCallService } from '../services/VideoCallService';
import WhiteboardService from '../services/WhiteboardService';

interface UseSessionCleanupOptions {
  sessionId: string;
  videoService: VideoCallService | null;
  onCleanupComplete?: () => void;
}

/**
 * Hook to handle session cleanup on unmount or page unload
 */
export function useSessionCleanup({
  sessionId,
  videoService,
  onCleanupComplete
}: UseSessionCleanupOptions) {
  const navigate = useNavigate();
  const isCleaningUp = useRef(false);
  const cleanupCompleted = useRef(false);

  /**
   * Perform session cleanup
   */
  const cleanup = useCallback(async () => {
    // Prevent multiple cleanup calls
    if (isCleaningUp.current || cleanupCompleted.current) {
      return;
    }

    isCleaningUp.current = true;

    try {
      await SessionCleanupService.cleanupSession(
        sessionId,
        videoService,
        WhiteboardService
      );

      cleanupCompleted.current = true;
      
      if (onCleanupComplete) {
        onCleanupComplete();
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    } finally {
      isCleaningUp.current = false;
    }
  }, [sessionId, videoService, onCleanupComplete]);

  /**
   * Handle page unload (browser close, refresh, navigation away)
   */
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Perform synchronous cleanup
      SessionCleanupService.clearTemporaryData();
      
      // Show confirmation dialog if session is active
      if (!cleanupCompleted.current) {
        event.preventDefault();
        event.returnValue = 'Are you sure you want to leave? Your session will be ended.';
        return event.returnValue;
      }
    };

    const handleUnload = () => {
      // Final cleanup on page unload
      SessionCleanupService.clearTemporaryData();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, []);

  /**
   * Cleanup on component unmount
   */
  useEffect(() => {
    return () => {
      if (!cleanupCompleted.current) {
        cleanup();
      }
    };
  }, [cleanup]);

  /**
   * Manual cleanup function (for leave button)
   */
  const leaveSession = useCallback(async () => {
    await cleanup();
    navigate('/');
  }, [cleanup, navigate]);

  return {
    leaveSession,
    isCleaningUp: isCleaningUp.current
  };
}
