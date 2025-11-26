/**
 * Unit tests for AnnotationStorageService
 * Tests save/load/clear operations, storage key generation, and error handling
 * Requirements: 1.2, 1.3, 1.4, 1.8, 1.9
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { annotationStorageService } from '../services/AnnotationStorageService';
import type { AnnotationStroke } from '../types/annotation-storage.types';

describe('AnnotationStorageService', () => {
  const testDocId = 'test_document_123';
  const testPage = 1;

  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('Save Operations', () => {
    it('should save annotations to sessionStorage', () => {
      const strokes: AnnotationStroke[] = [
        {
          id: 'stroke_1',
          tool: 'pen',
          color: '#FF0000',
          strokeWidth: 2,
          points: [
            { x: 10, y: 20 },
            { x: 30, y: 40 },
          ],
          timestamp: Date.now(),
        },
      ];

      const result = annotationStorageService.savePageAnnotations(testDocId, testPage, strokes);
      expect(result).toBe(true);

      const key = `annotation_${testDocId}_page_${testPage}`;
      const stored = sessionStorage.getItem(key);
      expect(stored).not.toBeNull();
    });

    it('should save multiple strokes correctly', () => {
      const strokes: AnnotationStroke[] = [
        {
          id: 'stroke_1',
          tool: 'pen',
          color: '#FF0000',
          strokeWidth: 2,
          points: [{ x: 10, y: 20 }],
          timestamp: Date.now(),
        },
        {
          id: 'stroke_2',
          tool: 'highlighter',
          color: '#FFFF00',
          strokeWidth: 6,
          points: [{ x: 50, y: 60 }],
          timestamp: Date.now(),
        },
      ];

      annotationStorageService.savePageAnnotations(testDocId, testPage, strokes);
      const loaded = annotationStorageService.loadPageAnnotations(testDocId, testPage);

      expect(loaded).toHaveLength(2);
      expect(loaded[0].id).toBe('stroke_1');
      expect(loaded[1].id).toBe('stroke_2');
    });

    it('should overwrite existing annotations on save', () => {
      const firstStrokes: AnnotationStroke[] = [
        {
          id: 'stroke_1',
          tool: 'pen',
          color: '#FF0000',
          strokeWidth: 2,
          points: [{ x: 10, y: 20 }],
          timestamp: Date.now(),
        },
      ];

      const secondStrokes: AnnotationStroke[] = [
        {
          id: 'stroke_2',
          tool: 'highlighter',
          color: '#00FF00',
          strokeWidth: 4,
          points: [{ x: 30, y: 40 }],
          timestamp: Date.now(),
        },
      ];

      annotationStorageService.savePageAnnotations(testDocId, testPage, firstStrokes);
      annotationStorageService.savePageAnnotations(testDocId, testPage, secondStrokes);

      const loaded = annotationStorageService.loadPageAnnotations(testDocId, testPage);
      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe('stroke_2');
    });
  });

  describe('Load Operations', () => {
    it('should load saved annotations correctly', () => {
      const strokes: AnnotationStroke[] = [
        {
          id: 'stroke_1',
          tool: 'pen',
          color: '#0000FF',
          strokeWidth: 3,
          points: [
            { x: 100, y: 200 },
            { x: 150, y: 250 },
          ],
          timestamp: 1234567890,
        },
      ];

      annotationStorageService.savePageAnnotations(testDocId, testPage, strokes);
      const loaded = annotationStorageService.loadPageAnnotations(testDocId, testPage);

      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe('stroke_1');
      expect(loaded[0].tool).toBe('pen');
      expect(loaded[0].color).toBe('#0000FF');
      expect(loaded[0].strokeWidth).toBe(3);
      expect(loaded[0].points).toHaveLength(2);
      expect(loaded[0].timestamp).toBe(1234567890);
    });

    it('should return empty array for non-existent page', () => {
      const loaded = annotationStorageService.loadPageAnnotations('nonexistent_doc', 999);
      expect(loaded).toEqual([]);
    });

    it('should handle corrupted data gracefully', () => {
      const key = `annotation_${testDocId}_page_${testPage}`;
      sessionStorage.setItem(key, 'invalid json data');

      const loaded = annotationStorageService.loadPageAnnotations(testDocId, testPage);
      expect(loaded).toEqual([]);
    });

    it('should load annotations from different pages independently', () => {
      const page1Strokes: AnnotationStroke[] = [
        {
          id: 'page1_stroke',
          tool: 'pen',
          color: '#FF0000',
          strokeWidth: 2,
          points: [{ x: 10, y: 10 }],
          timestamp: Date.now(),
        },
      ];

      const page2Strokes: AnnotationStroke[] = [
        {
          id: 'page2_stroke',
          tool: 'highlighter',
          color: '#00FF00',
          strokeWidth: 4,
          points: [{ x: 20, y: 20 }],
          timestamp: Date.now(),
        },
      ];

      annotationStorageService.savePageAnnotations(testDocId, 1, page1Strokes);
      annotationStorageService.savePageAnnotations(testDocId, 2, page2Strokes);

      const loaded1 = annotationStorageService.loadPageAnnotations(testDocId, 1);
      const loaded2 = annotationStorageService.loadPageAnnotations(testDocId, 2);

      expect(loaded1[0].id).toBe('page1_stroke');
      expect(loaded2[0].id).toBe('page2_stroke');
    });
  });

  describe('Clear Operations', () => {
    it('should clear all annotations for a document', () => {
      const strokes: AnnotationStroke[] = [
        {
          id: 'stroke_1',
          tool: 'pen',
          color: '#FF0000',
          strokeWidth: 2,
          points: [{ x: 10, y: 20 }],
          timestamp: Date.now(),
        },
      ];

      annotationStorageService.savePageAnnotations(testDocId, 1, strokes);
      annotationStorageService.savePageAnnotations(testDocId, 2, strokes);
      annotationStorageService.savePageAnnotations(testDocId, 3, strokes);

      annotationStorageService.clearDocumentAnnotations(testDocId);

      expect(annotationStorageService.loadPageAnnotations(testDocId, 1)).toEqual([]);
      expect(annotationStorageService.loadPageAnnotations(testDocId, 2)).toEqual([]);
      expect(annotationStorageService.loadPageAnnotations(testDocId, 3)).toEqual([]);
    });

    it('should clear specific page annotations', () => {
      const strokes: AnnotationStroke[] = [
        {
          id: 'stroke_1',
          tool: 'pen',
          color: '#FF0000',
          strokeWidth: 2,
          points: [{ x: 10, y: 20 }],
          timestamp: Date.now(),
        },
      ];

      annotationStorageService.savePageAnnotations(testDocId, 1, strokes);
      annotationStorageService.savePageAnnotations(testDocId, 2, strokes);

      annotationStorageService.clearPageAnnotations(testDocId, 1);

      expect(annotationStorageService.loadPageAnnotations(testDocId, 1)).toEqual([]);
      expect(annotationStorageService.loadPageAnnotations(testDocId, 2)).toHaveLength(1);
    });

    it('should not affect other documents when clearing', () => {
      const strokes: AnnotationStroke[] = [
        {
          id: 'stroke_1',
          tool: 'pen',
          color: '#FF0000',
          strokeWidth: 2,
          points: [{ x: 10, y: 20 }],
          timestamp: Date.now(),
        },
      ];

      annotationStorageService.savePageAnnotations('doc1', 1, strokes);
      annotationStorageService.savePageAnnotations('doc2', 1, strokes);

      annotationStorageService.clearDocumentAnnotations('doc1');

      expect(annotationStorageService.loadPageAnnotations('doc1', 1)).toEqual([]);
      expect(annotationStorageService.loadPageAnnotations('doc2', 1)).toHaveLength(1);
    });
  });

  describe('Storage Key Generation', () => {
    it('should generate consistent keys for same document and page', () => {
      const strokes: AnnotationStroke[] = [
        {
          id: 'stroke_1',
          tool: 'pen',
          color: '#FF0000',
          strokeWidth: 2,
          points: [{ x: 10, y: 20 }],
          timestamp: Date.now(),
        },
      ];

      annotationStorageService.savePageAnnotations(testDocId, testPage, strokes);

      const expectedKey = `annotation_${testDocId}_page_${testPage}`;
      const stored = sessionStorage.getItem(expectedKey);
      expect(stored).not.toBeNull();
    });

    it('should generate different keys for different pages', () => {
      const strokes1: AnnotationStroke[] = [
        {
          id: 'stroke_1',
          tool: 'pen',
          color: '#FF0000',
          strokeWidth: 2,
          points: [{ x: 10, y: 20 }],
          timestamp: Date.now(),
        },
      ];

      const strokes2: AnnotationStroke[] = [
        {
          id: 'stroke_2',
          tool: 'highlighter',
          color: '#00FF00',
          strokeWidth: 4,
          points: [{ x: 30, y: 40 }],
          timestamp: Date.now(),
        },
      ];

      annotationStorageService.savePageAnnotations(testDocId, 1, strokes1);
      annotationStorageService.savePageAnnotations(testDocId, 2, strokes2);

      const key1 = `annotation_${testDocId}_page_1`;
      const key2 = `annotation_${testDocId}_page_2`;

      expect(sessionStorage.getItem(key1)).not.toBeNull();
      expect(sessionStorage.getItem(key2)).not.toBeNull();
      expect(sessionStorage.getItem(key1)).not.toBe(sessionStorage.getItem(key2));
    });

    it('should generate different keys for different documents', () => {
      const strokes: AnnotationStroke[] = [
        {
          id: 'stroke_1',
          tool: 'pen',
          color: '#FF0000',
          strokeWidth: 2,
          points: [{ x: 10, y: 20 }],
          timestamp: Date.now(),
        },
      ];

      annotationStorageService.savePageAnnotations('doc1', 1, strokes);
      annotationStorageService.savePageAnnotations('doc2', 1, strokes);

      const key1 = 'annotation_doc1_page_1';
      const key2 = 'annotation_doc2_page_1';

      expect(sessionStorage.getItem(key1)).not.toBeNull();
      expect(sessionStorage.getItem(key2)).not.toBeNull();
    });
  });

  describe('Annotation Stroke Data Structure', () => {
    it('should preserve all stroke properties', () => {
      const stroke: AnnotationStroke = {
        id: 'test_stroke',
        tool: 'pen',
        color: '#123456',
        strokeWidth: 5,
        points: [
          { x: 1, y: 2 },
          { x: 3, y: 4 },
          { x: 5, y: 6 },
        ],
        timestamp: 9876543210,
      };

      annotationStorageService.savePageAnnotations(testDocId, testPage, [stroke]);
      const loaded = annotationStorageService.loadPageAnnotations(testDocId, testPage);

      expect(loaded[0]).toEqual(stroke);
    });

    it('should handle pen tool strokes', () => {
      const stroke: AnnotationStroke = {
        id: 'pen_stroke',
        tool: 'pen',
        color: '#000000',
        strokeWidth: 2,
        points: [{ x: 10, y: 20 }],
        timestamp: Date.now(),
      };

      annotationStorageService.savePageAnnotations(testDocId, testPage, [stroke]);
      const loaded = annotationStorageService.loadPageAnnotations(testDocId, testPage);

      expect(loaded[0].tool).toBe('pen');
    });

    it('should handle highlighter tool strokes', () => {
      const stroke: AnnotationStroke = {
        id: 'highlighter_stroke',
        tool: 'highlighter',
        color: '#FFFF00',
        strokeWidth: 6,
        points: [{ x: 10, y: 20 }],
        timestamp: Date.now(),
      };

      annotationStorageService.savePageAnnotations(testDocId, testPage, [stroke]);
      const loaded = annotationStorageService.loadPageAnnotations(testDocId, testPage);

      expect(loaded[0].tool).toBe('highlighter');
    });

    it('should handle strokes with many points', () => {
      const points = Array.from({ length: 100 }, (_, i) => ({ x: i, y: i * 2 }));
      const stroke: AnnotationStroke = {
        id: 'long_stroke',
        tool: 'pen',
        color: '#FF0000',
        strokeWidth: 2,
        points,
        timestamp: Date.now(),
      };

      annotationStorageService.savePageAnnotations(testDocId, testPage, [stroke]);
      const loaded = annotationStorageService.loadPageAnnotations(testDocId, testPage);

      expect(loaded[0].points).toHaveLength(100);
      expect(loaded[0].points[0]).toEqual({ x: 0, y: 0 });
      expect(loaded[0].points[99]).toEqual({ x: 99, y: 198 });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing data gracefully', () => {
      const loaded = annotationStorageService.loadPageAnnotations('missing_doc', 1);
      expect(loaded).toEqual([]);
    });

    it('should handle invalid JSON data', () => {
      const key = `annotation_${testDocId}_page_${testPage}`;
      sessionStorage.setItem(key, '{invalid json}');

      const loaded = annotationStorageService.loadPageAnnotations(testDocId, testPage);
      expect(loaded).toEqual([]);
    });

    it('should handle null values', () => {
      const key = `annotation_${testDocId}_page_${testPage}`;
      sessionStorage.setItem(key, 'null');

      const loaded = annotationStorageService.loadPageAnnotations(testDocId, testPage);
      expect(loaded).toEqual([]);
    });

    it('should handle empty string', () => {
      const key = `annotation_${testDocId}_page_${testPage}`;
      sessionStorage.setItem(key, '');

      const loaded = annotationStorageService.loadPageAnnotations(testDocId, testPage);
      expect(loaded).toEqual([]);
    });

    it('should handle array with invalid stroke objects', () => {
      const key = `annotation_${testDocId}_page_${testPage}`;
      sessionStorage.setItem(key, JSON.stringify([{ invalid: 'data' }]));

      const loaded = annotationStorageService.loadPageAnnotations(testDocId, testPage);
      // Should still load but may have incomplete data
      expect(Array.isArray(loaded)).toBe(true);
    });
  });
});
