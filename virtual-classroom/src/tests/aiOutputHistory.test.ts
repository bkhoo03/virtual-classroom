/**
 * Property-Based Tests for AIOutputHistoryManager
 * 
 * Tests the correctness properties of AI output history management
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { AIOutputHistoryManager } from '../services/AIOutputHistoryManager';
import { AIOutputEntry } from '../types/ai.types';

// Custom arbitraries for AI output history
const aiOutputEntryArbitrary = fc.record({
  id: fc.uuid(),
  timestamp: fc.date(),
  userQuery: fc.string({ minLength: 1, maxLength: 500 }),
  textResponse: fc.string({ minLength: 1, maxLength: 2000 }),
  images: fc.array(
    fc.record({
      url: fc.webUrl(),
      thumbnailUrl: fc.webUrl(),
      description: fc.string({ maxLength: 200 }),
      photographer: fc.string({ minLength: 2, maxLength: 50 }),
      photographerUrl: fc.webUrl(),
      unsplashUrl: fc.webUrl(),
      width: fc.integer({ min: 100, max: 4000 }),
      height: fc.integer({ min: 100, max: 4000 }),
      id: fc.uuid(),
    }),
    { maxLength: 5 }
  ),
  searchResults: fc.array(
    fc.record({
      title: fc.string({ minLength: 5, maxLength: 100 }),
      url: fc.webUrl(),
      snippet: fc.string({ minLength: 10, maxLength: 300 }),
      source: fc.string({ minLength: 3, maxLength: 50 }),
    }),
    { maxLength: 5 }
  ),
  processingTime: fc.integer({ min: 100, max: 10000 }),
});

describe('AIOutputHistoryManager Property Tests', () => {
  let historyManager: AIOutputHistoryManager;

  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();
    historyManager = new AIOutputHistoryManager();
  });

  afterEach(() => {
    // Clean up after each test
    sessionStorage.clear();
  });

  describe('Property 72: Response history addition', () => {
    it('**Feature: classroom-ui-overhaul, Property 72: Response history addition** - For any AI response generated, the response should be added to the history and appear in the history list', () => {
      fc.assert(
        fc.property(aiOutputEntryArbitrary, (entry) => {
          // Clear sessionStorage before each property test iteration
          sessionStorage.clear();
          
          // Given a history manager
          const manager = new AIOutputHistoryManager();
          const initialCount = manager.getHistoryCount();

          // When we add an entry
          manager.addEntry(entry);

          // Then the entry should appear in the history
          const history = manager.getHistory();
          const addedEntry = history.find(e => e.id === entry.id);

          expect(addedEntry).toBeDefined();
          expect(addedEntry?.id).toBe(entry.id);
          expect(addedEntry?.userQuery).toBe(entry.userQuery);
          expect(addedEntry?.textResponse).toBe(entry.textResponse);
          expect(manager.getHistoryCount()).toBe(initialCount + 1);
        }),
        { numRuns: 100 }
      );
    });

    it('should add multiple entries correctly', () => {
      fc.assert(
        fc.property(fc.array(aiOutputEntryArbitrary, { minLength: 1, maxLength: 10 }), (entries) => {
          // Clear sessionStorage before each property test iteration
          sessionStorage.clear();
          
          // Given a history manager
          const manager = new AIOutputHistoryManager();

          // When we add multiple entries
          entries.forEach(entry => manager.addEntry(entry));

          // Then all entries should be in the history
          const history = manager.getHistory();
          expect(history.length).toBe(entries.length);

          // All entry IDs should be present
          const historyIds = new Set(history.map(e => e.id));
          const entryIds = new Set(entries.map(e => e.id));
          expect(historyIds.size).toBe(entryIds.size);
          entryIds.forEach(id => expect(historyIds.has(id)).toBe(true));
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 73: Chronological history ordering', () => {
    it('**Feature: classroom-ui-overhaul, Property 73: Chronological history ordering** - For any set of AI responses in history, the responses should be ordered chronologically (newest first)', () => {
      fc.assert(
        fc.property(
          fc.array(aiOutputEntryArbitrary, { minLength: 2, maxLength: 20 })
            .filter(entries => {
              // Ensure all IDs are unique
              const ids = entries.map(e => e.id);
              return new Set(ids).size === ids.length;
            }),
          (entries) => {
            // Clear sessionStorage before each property test iteration
            sessionStorage.clear();
            
            // Given a history manager
            const manager = new AIOutputHistoryManager();

            // When we add entries in any order
            entries.forEach(entry => manager.addEntry(entry));

            // Then the history should be ordered with newest first
            const history = manager.getHistory();

            // The first entry added should be at the end (oldest)
            // The last entry added should be at the beginning (newest)
            expect(history[0].id).toBe(entries[entries.length - 1].id);
            expect(history[history.length - 1].id).toBe(entries[0].id);

            // Verify chronological order (newest to oldest)
            for (let i = 0; i < history.length - 1; i++) {
              const currentIndex = entries.findIndex(e => e.id === history[i].id);
              const nextIndex = entries.findIndex(e => e.id === history[i + 1].id);
              // Current entry was added after next entry
              expect(currentIndex).toBeGreaterThan(nextIndex);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 77: History cleanup on session end', () => {
    it('**Feature: classroom-ui-overhaul, Property 77: History cleanup on session end** - For any session end event, the AI output history should be cleared and empty', () => {
      fc.assert(
        fc.property(fc.array(aiOutputEntryArbitrary, { minLength: 1, maxLength: 20 }), (entries) => {
          // Given a history manager with entries
          const manager = new AIOutputHistoryManager();
          entries.forEach(entry => manager.addEntry(entry));
          expect(manager.getHistoryCount()).toBeGreaterThan(0);

          // When we clear the history (simulating session end)
          manager.clearHistory();

          // Then the history should be empty
          expect(manager.getHistoryCount()).toBe(0);
          expect(manager.getHistory()).toEqual([]);

          // And sessionStorage should be cleared
          const stored = sessionStorage.getItem('ai_output_history');
          expect(stored).toBeNull();
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 78: History persistence across refresh', () => {
    it('**Feature: classroom-ui-overhaul, Property 78: History persistence across refresh** - For any page refresh within a session, AI output history should be restored from sessionStorage', () => {
      fc.assert(
        fc.property(fc.array(aiOutputEntryArbitrary, { minLength: 1, maxLength: 10 }), (entries) => {
          // Clear sessionStorage before each property test iteration
          sessionStorage.clear();
          
          // Given a history manager with entries
          const manager1 = new AIOutputHistoryManager();
          entries.forEach(entry => manager1.addEntry(entry));
          const originalHistory = manager1.getHistory();

          // When we create a new manager (simulating page refresh)
          const manager2 = new AIOutputHistoryManager();

          // Then the history should be restored
          const restoredHistory = manager2.getHistory();
          expect(restoredHistory.length).toBe(originalHistory.length);

          // All entries should be present with correct data
          restoredHistory.forEach((entry, index) => {
            expect(entry.id).toBe(originalHistory[index].id);
            expect(entry.userQuery).toBe(originalHistory[index].userQuery);
            expect(entry.textResponse).toBe(originalHistory[index].textResponse);
            expect(entry.processingTime).toBe(originalHistory[index].processingTime);
            
            // Timestamps should be restored as Date objects or valid date strings
            const entryTimestamp = entry.timestamp instanceof Date ? entry.timestamp : new Date(entry.timestamp);
            const originalTimestamp = originalHistory[index].timestamp instanceof Date 
              ? originalHistory[index].timestamp 
              : new Date(originalHistory[index].timestamp);
            
            expect(entryTimestamp.getTime()).toBe(originalTimestamp.getTime());
          });
        }),
        { numRuns: 100 }
      );
    });

    it('should handle empty history on refresh', () => {
      // Given an empty history manager
      const manager1 = new AIOutputHistoryManager();
      expect(manager1.getHistoryCount()).toBe(0);

      // When we create a new manager (simulating page refresh)
      const manager2 = new AIOutputHistoryManager();

      // Then the history should still be empty
      expect(manager2.getHistoryCount()).toBe(0);
      expect(manager2.getHistory()).toEqual([]);
    });
  });

  describe('Additional correctness properties', () => {
    it('should limit history to maxEntries', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 5, max: 20 }),
          fc.array(aiOutputEntryArbitrary, { minLength: 30, maxLength: 100 }),
          (maxEntries, entries) => {
            // Given a history manager with a max entry limit
            const manager = new AIOutputHistoryManager({ maxEntries });

            // When we add more entries than the limit
            entries.forEach(entry => manager.addEntry(entry));

            // Then the history should not exceed maxEntries
            expect(manager.getHistoryCount()).toBeLessThanOrEqual(maxEntries);
            expect(manager.getHistory().length).toBeLessThanOrEqual(maxEntries);

            // And it should keep the newest entries
            const history = manager.getHistory();
            const newestEntries = entries.slice(-maxEntries).reverse();
            expect(history[0].id).toBe(newestEntries[0].id);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should retrieve entry by ID', () => {
      fc.assert(
        fc.property(fc.array(aiOutputEntryArbitrary, { minLength: 1, maxLength: 20 }), (entries) => {
          // Given a history manager with entries
          const manager = new AIOutputHistoryManager();
          entries.forEach(entry => manager.addEntry(entry));

          // When we retrieve an entry by ID
          const randomEntry = entries[Math.floor(Math.random() * entries.length)];
          const retrieved = manager.getEntryById(randomEntry.id);

          // Then we should get the correct entry
          expect(retrieved).toBeDefined();
          expect(retrieved?.id).toBe(randomEntry.id);
          expect(retrieved?.userQuery).toBe(randomEntry.userQuery);
          expect(retrieved?.textResponse).toBe(randomEntry.textResponse);
        }),
        { numRuns: 100 }
      );
    });

    it('should return null for non-existent ID', () => {
      fc.assert(
        fc.property(fc.uuid(), (nonExistentId) => {
          // Given a history manager
          const manager = new AIOutputHistoryManager();

          // When we try to retrieve a non-existent entry
          const retrieved = manager.getEntryById(nonExistentId);

          // Then we should get null
          expect(retrieved).toBeNull();
        }),
        { numRuns: 100 }
      );
    });

    it('should handle sessionStorage quota errors gracefully', () => {
      // Given a history manager
      const manager = new AIOutputHistoryManager({ maxEntries: 100 });

      // Create very large entries to potentially exceed quota
      const largeEntries = Array.from({ length: 50 }, (_, i) => ({
        id: `large-${i}`,
        timestamp: new Date(),
        userQuery: 'test query ' + i,
        textResponse: 'x'.repeat(10000), // Large response
        images: Array.from({ length: 10 }, (_, j) => ({
          id: `img-${i}-${j}`,
          url: `https://example.com/image-${i}-${j}.jpg`,
          thumbnailUrl: `https://example.com/thumb-${i}-${j}.jpg`,
          description: 'Test image ' + j,
          photographer: 'Test Photographer',
          photographerUrl: 'https://example.com/photographer',
          unsplashUrl: 'https://unsplash.com/photos/test',
          width: 1920,
          height: 1080,
        })),
        searchResults: [],
        processingTime: 1000,
      }));

      // When we add large entries (may exceed quota)
      // Then it should not throw an error
      expect(() => {
        largeEntries.forEach(entry => manager.addEntry(entry));
      }).not.toThrow();

      // And should still maintain some history
      expect(manager.getHistoryCount()).toBeGreaterThan(0);
    });

    it('should maintain history integrity after persistence', () => {
      fc.assert(
        fc.property(fc.array(aiOutputEntryArbitrary, { minLength: 1, maxLength: 10 }), (entries) => {
          // Clear sessionStorage before each property test iteration
          sessionStorage.clear();
          
          // Given a history manager with entries
          const manager = new AIOutputHistoryManager();
          entries.forEach(entry => manager.addEntry(entry));

          // When we manually persist
          manager.persistToSessionStorage();

          // And load into a new manager
          const newManager = new AIOutputHistoryManager();
          const loadedHistory = newManager.getHistory();

          // Then the history should match
          expect(loadedHistory.length).toBe(entries.length);
          loadedHistory.forEach((entry, index) => {
            const originalEntry = entries[entries.length - 1 - index]; // Reverse order
            expect(entry.id).toBe(originalEntry.id);
            expect(entry.userQuery).toBe(originalEntry.userQuery);
            expect(entry.textResponse).toBe(originalEntry.textResponse);
          });
        }),
        { numRuns: 100 }
      );
    });
  });
});
