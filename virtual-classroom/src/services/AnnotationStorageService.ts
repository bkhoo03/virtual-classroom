import type { AnnotationStroke } from '../types/annotation-storage.types';

/**
 * AnnotationStorageService manages per-page annotation persistence using sessionStorage
 * 
 * Storage keys are formatted as: `${documentId}_page_${pageNumber}`
 * This allows annotations to be stored and retrieved per page for each document
 * 
 * Performance optimizations:
 * - Limits strokes per page to 1000
 * - Automatically cleans up old document annotations when storage is full
 * - Tracks document access times for cleanup prioritization
 */
class AnnotationStorageService {
  private readonly STORAGE_PREFIX = 'annotation_';
  private readonly MAX_STROKES_PER_PAGE = 1000;
  private readonly DOCUMENT_ACCESS_KEY = 'annotation_document_access';

  /**
   * Generate storage key for a specific document and page
   */
  private getStorageKey(documentId: string, pageNumber: number): string {
    return `${this.STORAGE_PREFIX}${documentId}_page_${pageNumber}`;
  }

  /**
   * Update document access time for cleanup prioritization
   */
  private updateDocumentAccessTime(documentId: string): void {
    try {
      const accessData = this.getDocumentAccessData();
      accessData[documentId] = Date.now();
      sessionStorage.setItem(this.DOCUMENT_ACCESS_KEY, JSON.stringify(accessData));
    } catch (error) {
      console.error('Failed to update document access time:', error);
    }
  }

  /**
   * Get document access times
   */
  private getDocumentAccessData(): Record<string, number> {
    try {
      const data = sessionStorage.getItem(this.DOCUMENT_ACCESS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to get document access data:', error);
      return {};
    }
  }

  /**
   * Save annotations for a specific page
   * Enforces max strokes limit and updates document access time
   * @param documentId - Unique identifier for the document
   * @param pageNumber - Page number (1-indexed)
   * @param strokes - Array of annotation strokes to save
   * @returns true if saved successfully, false otherwise
   */
  savePageAnnotations(
    documentId: string,
    pageNumber: number,
    strokes: AnnotationStroke[]
  ): boolean {
    try {
      // Limit strokes per page to MAX_STROKES_PER_PAGE (keep most recent)
      const limitedStrokes = strokes.length > this.MAX_STROKES_PER_PAGE
        ? strokes.slice(-this.MAX_STROKES_PER_PAGE)
        : strokes;

      if (strokes.length > this.MAX_STROKES_PER_PAGE) {
        console.warn(`Stroke limit reached for page ${pageNumber}. Keeping ${this.MAX_STROKES_PER_PAGE} most recent strokes.`);
      }

      const key = this.getStorageKey(documentId, pageNumber);
      const data = JSON.stringify(limitedStrokes);
      sessionStorage.setItem(key, data);
      
      // Update document access time
      this.updateDocumentAccessTime(documentId);
      
      return true;
    } catch (error) {
      console.error('Failed to save page annotations:', error);
      // Handle storage quota exceeded or other errors
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded. Attempting to clear old annotations...');
        // Try to clear old annotations and retry
        this.clearOldestAnnotations();
        try {
          const limitedStrokes = strokes.length > this.MAX_STROKES_PER_PAGE
            ? strokes.slice(-this.MAX_STROKES_PER_PAGE)
            : strokes;
          const key = this.getStorageKey(documentId, pageNumber);
          const data = JSON.stringify(limitedStrokes);
          sessionStorage.setItem(key, data);
          this.updateDocumentAccessTime(documentId);
          return true;
        } catch (retryError) {
          console.error('Failed to save annotations after cleanup:', retryError);
          return false;
        }
      }
      return false;
    }
  }

  /**
   * Clear oldest annotations to free up storage space
   * Uses document access times to prioritize which documents to remove
   * Falls back to timestamp-based cleanup if access data is unavailable
   */
  private clearOldestAnnotations(): void {
    try {
      const accessData = this.getDocumentAccessData();
      const documentIds = new Set<string>();
      
      // Find all unique document IDs
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(this.STORAGE_PREFIX)) {
          // Extract document ID (format: annotation_DOCID_page_N)
          const match = key.match(/annotation_(.+)_page_\d+/);
          if (match) {
            documentIds.add(match[1]);
          }
        }
      }

      if (documentIds.size === 0) return;

      // Sort documents by access time (least recently accessed first)
      const sortedDocs = Array.from(documentIds).sort((a, b) => {
        const timeA = accessData[a] || 0;
        const timeB = accessData[b] || 0;
        
        // If no access data, try to extract timestamp from document ID
        if (timeA === 0 && timeB === 0) {
          const matchA = a.match(/doc_(\d+)_/);
          const matchB = b.match(/doc_(\d+)_/);
          const tsA = matchA ? parseInt(matchA[1], 10) : 0;
          const tsB = matchB ? parseInt(matchB[1], 10) : 0;
          return tsA - tsB;
        }
        
        return timeA - timeB;
      });

      // Remove annotations from the least recently accessed document
      const docToRemove = sortedDocs[0];
      this.clearDocumentAnnotations(docToRemove);
      
      // Clean up access data for removed document
      delete accessData[docToRemove];
      sessionStorage.setItem(this.DOCUMENT_ACCESS_KEY, JSON.stringify(accessData));
      
      console.log(`Cleared annotations for document: ${docToRemove}`);
    } catch (error) {
      console.error('Failed to clear oldest annotations:', error);
    }
  }

  /**
   * Load annotations for a specific page
   * Updates document access time when loading
   * @param documentId - Unique identifier for the document
   * @param pageNumber - Page number (1-indexed)
   * @returns Array of annotation strokes, or empty array if none exist
   */
  loadPageAnnotations(
    documentId: string,
    pageNumber: number
  ): AnnotationStroke[] {
    try {
      const key = this.getStorageKey(documentId, pageNumber);
      const data = sessionStorage.getItem(key);
      
      if (!data) {
        return [];
      }

      const strokes = JSON.parse(data) as AnnotationStroke[];
      
      // Update document access time
      this.updateDocumentAccessTime(documentId);
      
      return Array.isArray(strokes) ? strokes : [];
    } catch (error) {
      console.error('Failed to load page annotations:', error);
      return [];
    }
  }

  /**
   * Clear all annotations for a specific document
   * @param documentId - Unique identifier for the document
   */
  clearDocumentAnnotations(documentId: string): void {
    try {
      const keysToRemove: string[] = [];
      
      // Find all keys for this document
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(`${this.STORAGE_PREFIX}${documentId}_page_`)) {
          keysToRemove.push(key);
        }
      }

      // Remove all found keys
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear document annotations:', error);
    }
  }

  /**
   * Clear annotations for a specific page
   * @param documentId - Unique identifier for the document
   * @param pageNumber - Page number (1-indexed)
   */
  clearPageAnnotations(documentId: string, pageNumber: number): void {
    try {
      const key = this.getStorageKey(documentId, pageNumber);
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear page annotations:', error);
    }
  }

  /**
   * Get all page numbers that have annotations for a document
   * @param documentId - Unique identifier for the document
   * @returns Array of page numbers that have stored annotations
   */
  getAnnotatedPages(documentId: string): number[] {
    try {
      const pages: number[] = [];
      const prefix = `${this.STORAGE_PREFIX}${documentId}_page_`;

      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(prefix)) {
          const pageStr = key.substring(prefix.length);
          const pageNum = parseInt(pageStr, 10);
          if (!isNaN(pageNum)) {
            pages.push(pageNum);
          }
        }
      }

      return pages.sort((a, b) => a - b);
    } catch (error) {
      console.error('Failed to get annotated pages:', error);
      return [];
    }
  }

  /**
   * Clean up annotations for documents not accessed in the last N days
   * @param daysOld - Number of days after which to consider a document old (default: 7)
   * @returns Number of documents cleaned up
   */
  cleanupOldDocuments(daysOld: number = 7): number {
    try {
      const accessData = this.getDocumentAccessData();
      const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
      let cleanedCount = 0;

      // Find documents older than cutoff
      const documentsToClean = Object.entries(accessData)
        .filter(([_docId, accessTime]) => accessTime < cutoffTime)
        .map(([docId]) => docId);

      // Clean up old documents
      documentsToClean.forEach(docId => {
        this.clearDocumentAnnotations(docId);
        delete accessData[docId];
        cleanedCount++;
      });

      // Update access data
      if (cleanedCount > 0) {
        sessionStorage.setItem(this.DOCUMENT_ACCESS_KEY, JSON.stringify(accessData));
        console.log(`Cleaned up ${cleanedCount} old document(s)`);
      }

      return cleanedCount;
    } catch (error) {
      console.error('Failed to cleanup old documents:', error);
      return 0;
    }
  }

  /**
   * Get storage statistics
   * @returns Object with storage usage information
   */
  getStorageStats(): {
    totalDocuments: number;
    totalPages: number;
    estimatedSizeKB: number;
  } {
    try {
      const documents = new Set<string>();
      let totalPages = 0;
      let estimatedSize = 0;

      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(this.STORAGE_PREFIX)) {
          const match = key.match(/annotation_(.+)_page_\d+/);
          if (match) {
            documents.add(match[1]);
            totalPages++;
            
            const data = sessionStorage.getItem(key);
            if (data) {
              estimatedSize += data.length * 2; // Approximate bytes (UTF-16)
            }
          }
        }
      }

      return {
        totalDocuments: documents.size,
        totalPages,
        estimatedSizeKB: Math.round(estimatedSize / 1024),
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        totalDocuments: 0,
        totalPages: 0,
        estimatedSizeKB: 0,
      };
    }
  }
}

// Export singleton instance
export const annotationStorageService = new AnnotationStorageService();
export default annotationStorageService;
