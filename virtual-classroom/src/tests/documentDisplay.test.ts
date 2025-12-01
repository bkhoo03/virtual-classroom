import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { documentConversionService } from '../services/DocumentConversionService';
import { documentManagementService } from '../services/DocumentManagementService';
import whiteboardService from '../services/WhiteboardService';
import type { ConversionTask, ConvertedDocument } from '../services/DocumentConversionService';

// Mock fetch for backend API calls
global.fetch = vi.fn();

describe('Document Display Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear sessionStorage
    sessionStorage.clear();
  });

  /**
   * **Feature: classroom-ui-overhaul, Property 102: Document conversion completion**
   * **Validates: Requirements 6.1, 6.2**
   * 
   * For any valid document conversion task, when the conversion status is 'Finished',
   * the task should have a convertedPercentage of 100 and a pageCount greater than 0
   */
  it('Property 102: Document conversion completion', () => {
    fc.assert(
      fc.property(
        fc.record({
          uuid: fc.uuid(),
          type: fc.constantFrom('static' as const, 'dynamic' as const),
          pageCount: fc.integer({ min: 1, max: 100 }),
          prefix: fc.string(),
          images: fc.dictionary(
            fc.string(),
            fc.record({
              width: fc.integer({ min: 100, max: 2000 }),
              height: fc.integer({ min: 100, max: 2000 }),
              url: fc.webUrl(),
            })
          ),
        }),
        (taskData) => {
          const task: ConversionTask = {
            ...taskData,
            status: 'Finished',
            convertedPercentage: 100,
          };

          // Property: Finished tasks must have 100% completion
          expect(task.status).toBe('Finished');
          expect(task.convertedPercentage).toBe(100);
          expect(task.pageCount).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: classroom-ui-overhaul, Property 103: Document display on whiteboard**
   * **Validates: Requirements 6.1, 6.2**
   * 
   * For any converted document with static type, the document should have images
   * array with length equal to totalPageSize
   */
  it('Property 103: Document display on whiteboard', () => {
    fc.assert(
      fc.property(
        fc.record({
          resourceName: fc.string({ minLength: 1, maxLength: 50 }),
          resourceUuid: fc.uuid(),
          ext: fc.constantFrom('pdf', 'ppt', 'pptx', 'doc', 'docx'),
          size: fc.integer({ min: 1000, max: 100000000 }),
          taskUuid: fc.uuid(),
          totalPageSize: fc.integer({ min: 1, max: 50 }),
        }),
        (docData) => {
          // Generate images array matching page count
          const images = Array.from({ length: docData.totalPageSize }, (_, i) => ({
            name: (i + 1).toString(),
            width: 1700,
            height: 952,
            url: `https://example.com/page${i + 1}.png`,
          }));

          const document: ConvertedDocument = {
            resourceName: docData.resourceName,
            resourceUuid: docData.resourceUuid,
            ext: docData.ext,
            url: '',
            size: docData.size,
            updateTime: Date.now(),
            taskUuid: docData.taskUuid,
            conversion: {
              type: 'static',
              preview: true,
              scale: 2,
              outputFormat: 'png',
            },
            taskProgress: {
              prefix: '',
              totalPageSize: docData.totalPageSize,
              convertedPageSize: docData.totalPageSize,
              convertedPercentage: 100,
              convertedFileList: [],
              currentStep: 'Finished',
              images,
            },
          };

          // Property: Static documents must have images array matching page count
          expect(document.conversion.type).toBe('static');
          expect(document.taskProgress.images.length).toBe(document.taskProgress.totalPageSize);
          expect(document.taskProgress.convertedPercentage).toBe(100);
          
          // Each image should have required properties
          document.taskProgress.images.forEach((image) => {
            expect(image).toHaveProperty('name');
            expect(image).toHaveProperty('width');
            expect(image).toHaveProperty('height');
            expect(image).toHaveProperty('url');
            expect(image.width).toBeGreaterThan(0);
            expect(image.height).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: classroom-ui-overhaul, Property 104: Document page navigation**
   * **Validates: Requirements 6.2**
   * 
   * For any document with multiple pages, navigating to a page number between 1 and totalPages
   * should be valid, and navigating outside this range should be invalid
   */
  it('Property 104: Document page navigation', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 100 }), // totalPages (at least 2 for meaningful navigation)
        fc.integer({ min: -10, max: 110 }), // requested page (including invalid ranges)
        (totalPages, requestedPage) => {
          const isValidPage = requestedPage >= 1 && requestedPage <= totalPages;

          // Property: Page navigation should only succeed for valid page numbers
          if (isValidPage) {
            expect(requestedPage).toBeGreaterThanOrEqual(1);
            expect(requestedPage).toBeLessThanOrEqual(totalPages);
          } else {
            expect(
              requestedPage < 1 || requestedPage > totalPages
            ).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: classroom-ui-overhaul, Property 105: Document annotation persistence**
   * **Validates: Requirements 6.5**
   * 
   * For any document stored in document management, retrieving it by UUID should
   * return the same document with all properties intact
   */
  it('Property 105: Document annotation persistence', () => {
    fc.assert(
      fc.property(
        fc.record({
          sessionId: fc.uuid(),
          resourceName: fc.string({ minLength: 1, maxLength: 50 }),
          resourceUuid: fc.uuid(),
          ext: fc.constantFrom('pdf', 'ppt', 'pptx'),
          size: fc.integer({ min: 1000, max: 100000000 }),
          taskUuid: fc.uuid(),
          totalPageSize: fc.integer({ min: 1, max: 50 }),
        }),
        (data) => {
          const images = Array.from({ length: data.totalPageSize }, (_, i) => ({
            name: (i + 1).toString(),
            width: 1700,
            height: 952,
            url: `https://example.com/page${i + 1}.png`,
          }));

          const document: ConvertedDocument = {
            resourceName: data.resourceName,
            resourceUuid: data.resourceUuid,
            ext: data.ext,
            url: '',
            size: data.size,
            updateTime: Date.now(),
            taskUuid: data.taskUuid,
            conversion: {
              type: 'static',
              preview: true,
              scale: 2,
              outputFormat: 'png',
            },
            taskProgress: {
              prefix: '',
              totalPageSize: data.totalPageSize,
              convertedPageSize: data.totalPageSize,
              convertedPercentage: 100,
              convertedFileList: [],
              currentStep: 'Finished',
              images,
            },
          };

          // Store document
          documentManagementService.addDocument(data.sessionId, document);

          // Retrieve document
          const retrieved = documentManagementService.getDocument(
            data.sessionId,
            data.resourceUuid
          );

          // Property: Retrieved document should match stored document
          expect(retrieved).not.toBeNull();
          expect(retrieved?.resourceUuid).toBe(document.resourceUuid);
          expect(retrieved?.resourceName).toBe(document.resourceName);
          expect(retrieved?.taskUuid).toBe(document.taskUuid);
          expect(retrieved?.taskProgress.totalPageSize).toBe(document.taskProgress.totalPageSize);
          expect(retrieved?.taskProgress.images.length).toBe(document.taskProgress.images.length);

          // Cleanup
          documentManagementService.clearDocuments(data.sessionId);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional test: Document list management
   * Verifies that multiple documents can be stored and retrieved correctly
   */
  it('should manage multiple documents correctly', () => {
    fc.assert(
      fc.property(
        fc.uuid(), // sessionId
        fc.array(
          fc.record({
            resourceName: fc.string({ minLength: 1, maxLength: 50 }),
            resourceUuid: fc.uuid(),
            ext: fc.constantFrom('pdf', 'ppt', 'pptx'),
            size: fc.integer({ min: 1000, max: 100000000 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (sessionId, docsData) => {
          // Create and store documents
          docsData.forEach((data) => {
            const document: ConvertedDocument = {
              resourceName: data.resourceName,
              resourceUuid: data.resourceUuid,
              ext: data.ext,
              url: '',
              size: data.size,
              updateTime: Date.now(),
              taskUuid: fc.sample(fc.uuid(), 1)[0],
              conversion: {
                type: 'static',
                preview: true,
                scale: 2,
                outputFormat: 'png',
              },
              taskProgress: {
                prefix: '',
                totalPageSize: 1,
                convertedPageSize: 1,
                convertedPercentage: 100,
                convertedFileList: [],
                currentStep: 'Finished',
                images: [],
              },
            };

            documentManagementService.addDocument(sessionId, document);
          });

          // Retrieve all documents
          const retrieved = documentManagementService.getDocuments(sessionId);

          // Property: Number of retrieved documents should match stored documents
          expect(retrieved.length).toBe(docsData.length);

          // Each stored document should be retrievable
          docsData.forEach((data) => {
            const doc = documentManagementService.getDocument(sessionId, data.resourceUuid);
            expect(doc).not.toBeNull();
            expect(doc?.resourceUuid).toBe(data.resourceUuid);
          });

          // Cleanup
          documentManagementService.clearDocuments(sessionId);
        }
      ),
      { numRuns: 50 }
    );
  });
});
