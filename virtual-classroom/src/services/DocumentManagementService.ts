import type { ConvertedDocument } from './DocumentConversionService';

/**
 * DocumentManagementService - Manages converted documents for sessions
 * Stores documents in sessionStorage for persistence across page refreshes
 */
class DocumentManagementService {
  private storageKey = 'classroom_documents';

  /**
   * Get all documents for the current session
   */
  getDocuments(sessionId: string): ConvertedDocument[] {
    try {
      const key = `${this.storageKey}_${sessionId}`;
      const stored = sessionStorage.getItem(key);
      if (!stored) return [];
      
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading documents:', error);
      return [];
    }
  }

  /**
   * Add a document to the session
   */
  addDocument(sessionId: string, document: ConvertedDocument): void {
    try {
      const documents = this.getDocuments(sessionId);
      
      // Check if document already exists (by resourceUuid)
      const existingIndex = documents.findIndex(
        doc => doc.resourceUuid === document.resourceUuid
      );
      
      if (existingIndex >= 0) {
        // Update existing document
        documents[existingIndex] = document;
      } else {
        // Add new document
        documents.push(document);
      }
      
      const key = `${this.storageKey}_${sessionId}`;
      sessionStorage.setItem(key, JSON.stringify(documents));
      
      console.log('Document saved:', document.resourceName);
    } catch (error) {
      console.error('Error saving document:', error);
    }
  }

  /**
   * Get a specific document by UUID
   */
  getDocument(sessionId: string, resourceUuid: string): ConvertedDocument | null {
    const documents = this.getDocuments(sessionId);
    return documents.find(doc => doc.resourceUuid === resourceUuid) || null;
  }

  /**
   * Remove a document from the session
   */
  removeDocument(sessionId: string, resourceUuid: string): void {
    try {
      const documents = this.getDocuments(sessionId);
      const filtered = documents.filter(doc => doc.resourceUuid !== resourceUuid);
      
      const key = `${this.storageKey}_${sessionId}`;
      sessionStorage.setItem(key, JSON.stringify(filtered));
      
      console.log('Document removed:', resourceUuid);
    } catch (error) {
      console.error('Error removing document:', error);
    }
  }

  /**
   * Clear all documents for a session
   */
  clearDocuments(sessionId: string): void {
    try {
      const key = `${this.storageKey}_${sessionId}`;
      sessionStorage.removeItem(key);
      console.log('All documents cleared for session:', sessionId);
    } catch (error) {
      console.error('Error clearing documents:', error);
    }
  }

  /**
   * Check if a document has already been converted
   * Useful to avoid re-converting the same file
   */
  isDocumentConverted(sessionId: string, fileName: string): boolean {
    const documents = this.getDocuments(sessionId);
    return documents.some(doc => doc.resourceName === fileName);
  }

  /**
   * Get document by task UUID (useful for checking conversion status)
   */
  getDocumentByTaskUuid(sessionId: string, taskUuid: string): ConvertedDocument | null {
    const documents = this.getDocuments(sessionId);
    return documents.find(doc => doc.taskUuid === taskUuid) || null;
  }
}

// Export singleton instance
export const documentManagementService = new DocumentManagementService();
export default documentManagementService;
