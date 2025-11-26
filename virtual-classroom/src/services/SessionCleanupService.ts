import SessionSecurityService from './SessionSecurityService';
import { VideoCallService } from './VideoCallService';
import WhiteboardService from './WhiteboardService';

/**
 * Service for handling session cleanup
 * Ensures all connections are terminated and data is cleared within 30 seconds
 */
class SessionCleanupService {
  private static instance: SessionCleanupService;
  private cleanupTimeout: number = 30000; // 30 seconds
  private cleanupTimer: ReturnType<typeof setTimeout> | null = null;

  private constructor() {}

  public static getInstance(): SessionCleanupService {
    if (!SessionCleanupService.instance) {
      SessionCleanupService.instance = new SessionCleanupService();
    }
    return SessionCleanupService.instance;
  }

  /**
   * Cleanup session with timeout guarantee
   */
  public async cleanupSession(
    sessionId: string,
    videoService: VideoCallService | null,
    whiteboardService: typeof WhiteboardService | null
  ): Promise<void> {
    console.log(`Starting session cleanup for: ${sessionId}`);
    
    const startTime = Date.now();

    // Create a promise that rejects after timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      this.cleanupTimer = setTimeout(() => {
        reject(new Error('Session cleanup timeout exceeded'));
      }, this.cleanupTimeout);
    });

    // Create cleanup promise
    const cleanupPromise = this.performCleanup(sessionId, videoService, whiteboardService);

    try {
      // Race between cleanup and timeout
      await Promise.race([cleanupPromise, timeoutPromise]);
      
      const duration = Date.now() - startTime;
      console.log(`Session cleanup completed in ${duration}ms`);
    } catch (error) {
      console.error('Session cleanup error:', error);
      // Force cleanup even if error occurs
      await this.forceCleanup(videoService, whiteboardService);
    } finally {
      // Clear timeout
      if (this.cleanupTimer) {
        clearTimeout(this.cleanupTimer);
        this.cleanupTimer = null;
      }
    }
  }

  /**
   * Perform cleanup operations
   */
  private async performCleanup(
    sessionId: string,
    videoService: VideoCallService | null,
    whiteboardService: typeof WhiteboardService | null
  ): Promise<void> {
    const cleanupTasks: Promise<void>[] = [];

    // 1. Cleanup video call connections
    if (videoService) {
      cleanupTasks.push(
        this.cleanupVideoCall(videoService).catch(err => {
          console.error('Video cleanup error:', err);
        })
      );
    }

    // 2. Cleanup whiteboard connections
    if (whiteboardService) {
      cleanupTasks.push(
        this.cleanupWhiteboard(whiteboardService).catch(err => {
          console.error('Whiteboard cleanup error:', err);
        })
      );
    }

    // 3. Clear session storage
    cleanupTasks.push(
      this.clearSessionStorage(sessionId).catch(err => {
        console.error('Storage cleanup error:', err);
      })
    );

    // 4. End session on backend
    cleanupTasks.push(
      this.endBackendSession(sessionId).catch(err => {
        console.error('Backend session end error:', err);
      })
    );

    // Wait for all cleanup tasks to complete
    await Promise.all(cleanupTasks);
  }

  /**
   * Cleanup video call service
   */
  private async cleanupVideoCall(videoService: VideoCallService): Promise<void> {
    try {
      await videoService.cleanup();
      console.log('Video call cleanup completed');
    } catch (error) {
      console.error('Error cleaning up video call:', error);
      throw error;
    }
  }

  /**
   * Cleanup whiteboard service
   */
  private async cleanupWhiteboard(whiteboardService: typeof WhiteboardService): Promise<void> {
    try {
      await whiteboardService.leaveRoom();
      console.log('Whiteboard cleanup completed');
    } catch (error) {
      console.error('Error cleaning up whiteboard:', error);
      throw error;
    }
  }

  /**
   * Clear session storage
   */
  private async clearSessionStorage(sessionId: string): Promise<void> {
    try {
      // Clear session-specific data from sessionStorage
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.includes(sessionId)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => sessionStorage.removeItem(key));

      // Clear classroom state from sessionStorage
      sessionStorage.removeItem('classroomState');
      sessionStorage.removeItem('videoState');
      sessionStorage.removeItem('whiteboardState');
      sessionStorage.removeItem('aiState');

      console.log('Session storage cleared');
    } catch (error) {
      console.error('Error clearing session storage:', error);
      throw error;
    }
  }

  /**
   * End session on backend
   */
  private async endBackendSession(sessionId: string): Promise<void> {
    try {
      await SessionSecurityService.endSession(sessionId);
      console.log('Backend session ended');
    } catch (error) {
      console.error('Error ending backend session:', error);
      // Don't throw - backend cleanup is not critical
    }
  }

  /**
   * Force cleanup if normal cleanup fails
   */
  private async forceCleanup(
    videoService: VideoCallService | null,
    whiteboardService: typeof WhiteboardService | null
  ): Promise<void> {
    console.warn('Forcing session cleanup...');

    // Force stop video
    if (videoService) {
      try {
        await videoService.cleanup();
      } catch (error) {
        console.error('Force video cleanup error:', error);
      }
    }

    // Force stop whiteboard
    if (whiteboardService) {
      try {
        await whiteboardService.leaveRoom();
      } catch (error) {
        console.error('Force whiteboard cleanup error:', error);
      }
    }

    // Clear all storage
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Force storage cleanup error:', error);
    }
  }

  /**
   * Clear temporary data (called periodically or on page unload)
   */
  public clearTemporaryData(): void {
    try {
      // Clear any cached tokens
      sessionStorage.removeItem('agoraToken');
      sessionStorage.removeItem('whiteboardToken');
      
      // Clear temporary media files
      // Note: Actual implementation depends on how media is stored
      
      console.log('Temporary data cleared');
    } catch (error) {
      console.error('Error clearing temporary data:', error);
    }
  }
}

export default SessionCleanupService.getInstance();
