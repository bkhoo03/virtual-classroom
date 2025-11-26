/**
 * Performance tests for annotation system optimizations
 * Tests the implementations from task 12 of presentation-redesign spec
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { annotationStorageService } from '../services/AnnotationStorageService';
import type { AnnotationStroke } from '../types/annotation-storage.types';

describe('Annotation Performance Optimizations', () => {
  const testDocId = 'test_doc_123';
  const testPage = 1;

  beforeEach(() => {
    // Clear storage before each test
    sessionStorage.clear();
  });

  describe('Max Strokes Per Page Limit', () => {
    it('should limit strokes to 1000 per page', () => {
      // Create 1500 test strokes
      const strokes: AnnotationStroke[] = Array.from({ length: 1500 }, (_, i) => ({
        id: `stroke_${i}`,
        tool: 'pen' as const,
        color: '#000000',
        strokeWidth: 2,
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 10 },
        ],
        timestamp: Date.now() + i,
      }));

      // Save strokes
      const saved = annotationStorageService.savePageAnnotations(testDocId, testPage, strokes);
      expect(saved).toBe(true);

      // Load strokes
      const loadedStrokes = annotationStorageService.loadPageAnnotations(testDocId, testPage);

      // Should only have 1000 strokes (most recent)
      expect(loadedStrokes.length).toBe(1000);

      // Should have kept the most recent strokes
      expect(loadedStrokes[0].id).toBe('stroke_500');
      expect(loadedStrokes[999].id).toBe('stroke_1499');
    });

    it('should not limit strokes below 1000', () => {
      const strokes: AnnotationStroke[] = Array.from({ length: 500 }, (_, i) => ({
        id: `stroke_${i}`,
        tool: 'pen' as const,
        color: '#000000',
        strokeWidth: 2,
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 10 },
        ],
        timestamp: Date.now() + i,
      }));

      annotationStorageService.savePageAnnotations(testDocId, testPage, strokes);
      const loadedStrokes = annotationStorageService.loadPageAnnotations(testDocId, testPage);

      expect(loadedStrokes.length).toBe(500);
    });
  });

  describe('Document Access Time Tracking', () => {
    it('should update access time when saving annotations', () => {
      const strokes: AnnotationStroke[] = [
        {
          id: 'stroke_1',
          tool: 'pen',
          color: '#000000',
          strokeWidth: 2,
          points: [
            { x: 0, y: 0 },
            { x: 10, y: 10 },
          ],
          timestamp: Date.now(),
        },
      ];

      const beforeTime = Date.now();
      annotationStorageService.savePageAnnotations(testDocId, testPage, strokes);
      const afterTime = Date.now();

      // Access time should be stored
      const accessData = JSON.parse(
        sessionStorage.getItem('annotation_document_access') || '{}'
      );

      expect(accessData[testDocId]).toBeDefined();
      expect(accessData[testDocId]).toBeGreaterThanOrEqual(beforeTime);
      expect(accessData[testDocId]).toBeLessThanOrEqual(afterTime);
    });

    it('should update access time when loading annotations', () => {
      const strokes: AnnotationStroke[] = [
        {
          id: 'stroke_1',
          tool: 'pen',
          color: '#000000',
          strokeWidth: 2,
          points: [
            { x: 0, y: 0 },
            { x: 10, y: 10 },
          ],
          timestamp: Date.now(),
        },
      ];

      annotationStorageService.savePageAnnotations(testDocId, testPage, strokes);

      // Wait a bit
      const waitTime = 10;
      const startTime = Date.now();
      while (Date.now() - startTime < waitTime) {
        // Wait
      }

      const beforeLoad = Date.now();
      annotationStorageService.loadPageAnnotations(testDocId, testPage);
      const afterLoad = Date.now();

      const accessData = JSON.parse(
        sessionStorage.getItem('annotation_document_access') || '{}'
      );

      // Access time should be updated
      expect(accessData[testDocId]).toBeGreaterThanOrEqual(beforeLoad);
      expect(accessData[testDocId]).toBeLessThanOrEqual(afterLoad);
    });
  });

  describe('Old Document Cleanup', () => {
    it('should clean up documents older than specified days', () => {
      const oldDocId = 'old_doc_123';
      const newDocId = 'new_doc_456';

      // Create old document with old access time (8 days ago)
      const oldTime = Date.now() - 8 * 24 * 60 * 60 * 1000;
      const accessData = {
        [oldDocId]: oldTime,
        [newDocId]: Date.now(),
      };
      sessionStorage.setItem('annotation_document_access', JSON.stringify(accessData));

      // Save annotations for both documents
      const strokes: AnnotationStroke[] = [
        {
          id: 'stroke_1',
          tool: 'pen',
          color: '#000000',
          strokeWidth: 2,
          points: [
            { x: 0, y: 0 },
            { x: 10, y: 10 },
          ],
          timestamp: Date.now(),
        },
      ];

      annotationStorageService.savePageAnnotations(oldDocId, 1, strokes);
      annotationStorageService.savePageAnnotations(newDocId, 1, strokes);

      // Clean up documents older than 7 days
      const cleanedCount = annotationStorageService.cleanupOldDocuments(7);

      expect(cleanedCount).toBe(1);

      // Old document should be removed
      const oldAnnotations = annotationStorageService.loadPageAnnotations(oldDocId, 1);
      expect(oldAnnotations.length).toBe(0);

      // New document should still exist
      const newAnnotations = annotationStorageService.loadPageAnnotations(newDocId, 1);
      expect(newAnnotations.length).toBe(1);
    });

    it('should not clean up recent documents', () => {
      const recentDocId = 'recent_doc_123';

      // Create recent document (2 days ago)
      const recentTime = Date.now() - 2 * 24 * 60 * 60 * 1000;
      const accessData = {
        [recentDocId]: recentTime,
      };
      sessionStorage.setItem('annotation_document_access', JSON.stringify(accessData));

      const strokes: AnnotationStroke[] = [
        {
          id: 'stroke_1',
          tool: 'pen',
          color: '#000000',
          strokeWidth: 2,
          points: [
            { x: 0, y: 0 },
            { x: 10, y: 10 },
          ],
          timestamp: Date.now(),
        },
      ];

      annotationStorageService.savePageAnnotations(recentDocId, 1, strokes);

      // Clean up documents older than 7 days
      const cleanedCount = annotationStorageService.cleanupOldDocuments(7);

      expect(cleanedCount).toBe(0);

      // Recent document should still exist
      const annotations = annotationStorageService.loadPageAnnotations(recentDocId, 1);
      expect(annotations.length).toBe(1);
    });
  });

  describe('Storage Statistics', () => {
    it('should return accurate storage statistics', () => {
      const doc1 = 'doc_1';
      const doc2 = 'doc_2';

      const strokes: AnnotationStroke[] = [
        {
          id: 'stroke_1',
          tool: 'pen',
          color: '#000000',
          strokeWidth: 2,
          points: [
            { x: 0, y: 0 },
            { x: 10, y: 10 },
          ],
          timestamp: Date.now(),
        },
      ];

      // Save annotations for 2 documents, 2 pages each
      annotationStorageService.savePageAnnotations(doc1, 1, strokes);
      annotationStorageService.savePageAnnotations(doc1, 2, strokes);
      annotationStorageService.savePageAnnotations(doc2, 1, strokes);
      annotationStorageService.savePageAnnotations(doc2, 2, strokes);

      const stats = annotationStorageService.getStorageStats();

      expect(stats.totalDocuments).toBe(2);
      expect(stats.totalPages).toBe(4);
      expect(stats.estimatedSizeKB).toBeGreaterThan(0);
    });

    it('should return zero stats for empty storage', () => {
      const stats = annotationStorageService.getStorageStats();

      expect(stats.totalDocuments).toBe(0);
      expect(stats.totalPages).toBe(0);
      expect(stats.estimatedSizeKB).toBe(0);
    });
  });

  describe('Storage Quota Handling', () => {
    it('should handle storage quota exceeded by cleaning old documents', () => {
      // This test verifies the cleanup mechanism is in place
      // Actual quota exceeded testing would require filling storage
      const doc1 = 'doc_1';
      const doc2 = 'doc_2';

      // Create old document
      const oldTime = Date.now() - 10 * 24 * 60 * 60 * 1000;
      const accessData = {
        [doc1]: oldTime,
        [doc2]: Date.now(),
      };
      sessionStorage.setItem('annotation_document_access', JSON.stringify(accessData));

      const strokes: AnnotationStroke[] = [
        {
          id: 'stroke_1',
          tool: 'pen',
          color: '#000000',
          strokeWidth: 2,
          points: [
            { x: 0, y: 0 },
            { x: 10, y: 10 },
          ],
          timestamp: Date.now(),
        },
      ];

      annotationStorageService.savePageAnnotations(doc1, 1, strokes);
      annotationStorageService.savePageAnnotations(doc2, 1, strokes);

      // Verify both documents exist
      expect(annotationStorageService.loadPageAnnotations(doc1, 1).length).toBe(1);
      expect(annotationStorageService.loadPageAnnotations(doc2, 1).length).toBe(1);

      // Clean up old documents
      annotationStorageService.cleanupOldDocuments(7);

      // Old document should be removed
      expect(annotationStorageService.loadPageAnnotations(doc1, 1).length).toBe(0);
      // New document should remain
      expect(annotationStorageService.loadPageAnnotations(doc2, 1).length).toBe(1);
    });
  });
});
