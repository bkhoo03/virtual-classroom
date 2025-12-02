/**
 * PDFSyncService handles synchronization of PDF page changes across users
 * Uses localStorage for simple cross-tab communication
 * Can be enhanced with WebSocket/Socket.IO for real-time sync
 */

type PDFSyncCallback = (page: number, pdfUrl: string) => void;

class PDFSyncService {
  private callbacks: Map<string, PDFSyncCallback[]> = new Map();
  private currentPage: Map<string, number> = new Map();
  private storageKey = 'pdf_sync_state';

  constructor() {
    // Listen for storage events (cross-tab communication)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageChange);
    }
  }

  /**
   * Subscribe to PDF page changes for a specific session
   */
  subscribe(sessionId: string, callback: PDFSyncCallback): () => void {
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

    // Store in localStorage for cross-tab sync
    try {
      const syncState = {
        sessionId,
        pdfUrl,
        page,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.storageKey, JSON.stringify(syncState));
    } catch (error) {
      console.error('Failed to sync PDF page to localStorage:', error);
    }

    // Notify all subscribers for this session
    const callbacks = this.callbacks.get(sessionId);
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

  /**
   * Get the current page for a PDF in a session
   */
  getCurrentPage(sessionId: string, pdfUrl: string): number {
    const key = `${sessionId}:${pdfUrl}`;
    return this.currentPage.get(key) || 1;
  }

  /**
   * Handle storage changes from other tabs
   */
  private handleStorageChange = (event: StorageEvent) => {
    if (event.key !== this.storageKey || !event.newValue) {
      return;
    }

    try {
      const syncState = JSON.parse(event.newValue);
      const { sessionId, pdfUrl, page } = syncState;

      // Update local state
      const key = `${sessionId}:${pdfUrl}`;
      this.currentPage.set(key, page);

      // Notify subscribers
      const callbacks = this.callbacks.get(sessionId);
      if (callbacks) {
        callbacks.forEach(callback => {
          try {
            callback(page, pdfUrl);
          } catch (error) {
            console.error('Error in PDF sync callback:', error);
          }
        });
      }
    } catch (error) {
      console.error('Error parsing PDF sync state:', error);
    }
  };

  /**
   * Clean up resources
   */
  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageChange);
    }
    this.callbacks.clear();
    this.currentPage.clear();
  }
}

// Export singleton instance
export const pdfSyncService = new PDFSyncService();
export default pdfSyncService;
