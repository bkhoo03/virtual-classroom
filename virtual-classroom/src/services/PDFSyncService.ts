import { io, Socket } from 'socket.io-client';

/**
 * PDFSyncService handles synchronization of PDF page changes across users
 * Uses Socket.IO for real-time WebSocket communication
 */

type PDFSyncCallback = (page: number, pdfUrl: string) => void;

class PDFSyncService {
  private callbacks: Map<string, PDFSyncCallback[]> = new Map();
  private currentPage: Map<string, number> = new Map();
  private socket: Socket | null = null;
  private currentSessionId: string | null = null;

  constructor() {
    this.initializeSocket();
  }

  /**
   * Initialize Socket.IO connection
   */
  private initializeSocket(): void {
    // Get backend URL from environment
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    
    // Only initialize if backend URL is configured
    if (!backendUrl || backendUrl.includes('vercel.app')) {
      console.log('📡 [PDFSync] WebSocket disabled (no backend URL or using Vercel)');
      console.log('📡 [PDFSync] PDF viewer will work but page changes won\'t sync across users');
      return;
    }
    
    try {
      this.socket = io(backendUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('📡 [PDFSync] Connected to WebSocket server');
        // Rejoin session if we were in one
        if (this.currentSessionId) {
          this.socket?.emit('join-session', this.currentSessionId);
        }
      });

      this.socket.on('disconnect', () => {
        console.log('📡 [PDFSync] Disconnected from WebSocket server');
      });

      this.socket.on('pdf-page-changed', ({ pdfUrl, page }: { pdfUrl: string; page: number }) => {
        console.log('📡 [PDFSync] Received page change:', { pdfUrl, page });
        
        // Update local state
        if (this.currentSessionId) {
          const key = `${this.currentSessionId}:${pdfUrl}`;
          this.currentPage.set(key, page);

          // Notify subscribers
          const callbacks = this.callbacks.get(this.currentSessionId);
          if (callbacks) {
            callbacks.forEach(callback => {
              try {
                callback(page, pdfUrl);
              } catch (error) {
                console.error('Error in PDF sync callback:', error);
              }
            });
          }
        }
      });

      this.socket.on('connect_error', (error) => {
        console.warn('📡 [PDFSync] Connection error (WebSocket sync disabled):', error.message);
      });
    } catch (error) {
      console.warn('📡 [PDFSync] Failed to initialize WebSocket:', error);
    }
  }

  /**
   * Subscribe to PDF page changes for a specific session
   */
  subscribe(sessionId: string, callback: PDFSyncCallback): () => void {
    // Join the session room (only if socket is available)
    if (this.socket && this.currentSessionId !== sessionId) {
      if (this.currentSessionId) {
        this.socket.emit('leave-session', this.currentSessionId);
      }
      this.currentSessionId = sessionId;
      this.socket.emit('join-session', sessionId);
      console.log('📡 [PDFSync] Joined session:', sessionId);
    }

    if (!this.callbacks.has(sessionId)) {
      this.callbacks.set(sessionId, []);
    }
    
    this.callbacks.get(sessionId)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.callbacks.get(sessionId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Update the current page for a PDF in a session
   */
  updatePage(sessionId: string, pdfUrl: string, page: number): void {
    const key = `${sessionId}:${pdfUrl}`;
    this.currentPage.set(key, page);

    // Emit page change via Socket.IO (if available)
    if (this.socket?.connected) {
      this.socket.emit('pdf-page-change', { sessionId, pdfUrl, page });
      console.log('📡 [PDFSync] Sent page change:', { sessionId, pdfUrl, page });
    }
    // Silently fail if socket not available - PDF will still work locally
  }

  /**
   * Get the current page for a PDF in a session
   */
  getCurrentPage(sessionId: string, pdfUrl: string): number {
    const key = `${sessionId}:${pdfUrl}`;
    return this.currentPage.get(key) || 1;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.currentSessionId) {
      this.socket?.emit('leave-session', this.currentSessionId);
    }
    this.socket?.disconnect();
    this.callbacks.clear();
    this.currentPage.clear();
  }
}

// Export singleton instance
export const pdfSyncService = new PDFSyncService();
export default pdfSyncService;
