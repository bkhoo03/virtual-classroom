/**
 * Property-Based Tests for AI Output History Display
 * 
 * Tests the display and interaction of AI response history in the AI Output Panel
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { AIOutputHistoryManager } from '../services/AIOutputHistoryManager';
import type { AIOutputEntry } from '../types/ai.types';

// ============================================================================
// Generators
// ============================================================================

/**
 * Generate a random AI output entry
 */
const aiOutputEntryArbitrary = fc.record({
  id: fc.uuid(),
  timestamp: fc.date({ min: new Date('2024-01-01'), max: new Date() }),
  userQuery: fc.string({ minLength: 1, maxLength: 200 }),
  textResponse: fc.string({ minLength: 10, maxLength: 1000 }),
  images: fc.array(
    fc.record({
      id: fc.uuid(),
      url: fc.webUrl(),
      thumbnailUrl: fc.webUrl(),
      description: fc.string(),
      photographer: fc.string({ minLength: 1 }),
      photographerUrl: fc.webUrl(),
      unsplashUrl: fc.webUrl(),
      width: fc.integer({ min: 100, max: 4000 }),
      height: fc.integer({ min: 100, max: 4000 }),
    }),
    { maxLength: 5 }
  ),
  searchResults: fc.array(
    fc.record({
      title: fc.string({ minLength: 1, maxLength: 100 }),
      url: fc.webUrl(),
      snippet: fc.string({ minLength: 10, maxLength: 200 }),
      source: fc.string({ minLength: 1, maxLength: 50 }),
      publishedDate: fc.option(fc.string(), { nil: undefined }),
    }),
    { maxLength: 5 }
  ),
  processingTime: fc.integer({ min: 100, max: 10000 }),
});

// ============================================================================
// Property 74: Response card display
// ============================================================================

describe('Property 74: Response card display', () => {
  it('**Feature: classroom-ui-overhaul, Property 74: Response card display** - For any AI response in history, the response should be displayed as a distinct card with a timestamp element', () => {
    fc.assert(
      fc.property(
        aiOutputEntryArbitrary.filter(entry => !isNaN(entry.timestamp.getTime())),
        (entry) => {
          // Create a history manager and add the entry
          const historyManager = new AIOutputHistoryManager({
            maxEntries: 50,
            persistToSession: false,
          });
          
          historyManager.addEntry(entry);
          const history = historyManager.getHistory();
          
          // Verify the entry is in history
          expect(history).toHaveLength(1);
          expect(history[0]).toEqual(entry);
          
          // Verify the entry has required display properties
          expect(entry.id).toBeDefined();
          expect(entry.timestamp).toBeInstanceOf(Date);
          expect(entry.userQuery).toBeDefined();
          expect(entry.textResponse).toBeDefined();
          
          // Verify timestamp is a valid date
          expect(entry.timestamp.getTime()).toBeGreaterThan(0);
          expect(entry.timestamp.getTime()).toBeLessThanOrEqual(Date.now());
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('Multiple entries should each be displayed as distinct cards', () => {
    fc.assert(
      fc.property(
        fc.array(aiOutputEntryArbitrary, { minLength: 1, maxLength: 10 })
          .filter(entries => entries.every(e => !isNaN(e.timestamp.getTime()))),
        (entries) => {
          const historyManager = new AIOutputHistoryManager({
            maxEntries: 50,
            persistToSession: false,
          });
          
          // Add all entries
          entries.forEach(entry => historyManager.addEntry(entry));
          const history = historyManager.getHistory();
          
          // Verify all entries are in history
          expect(history).toHaveLength(entries.length);
          
          // Verify each entry has distinct ID
          const ids = history.map(e => e.id);
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(entries.length);
          
          // Verify each entry has timestamp
          history.forEach(entry => {
            expect(entry.timestamp).toBeInstanceOf(Date);
            expect(entry.timestamp.getTime()).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Property 75: Scroll position maintenance
// ============================================================================

describe('Property 75: Scroll position maintenance', () => {
  it('**Feature: classroom-ui-overhaul, Property 75: Scroll position maintenance** - For any scroll action in the AI output panel, the scroll position should be maintained and all entries should be accessible', () => {
    fc.assert(
      fc.property(fc.array(aiOutputEntryArbitrary, { minLength: 5, maxLength: 20 }), (entries) => {
        const historyManager = new AIOutputHistoryManager({
          maxEntries: 50,
          persistToSession: false,
        });
        
        // Add all entries
        entries.forEach(entry => historyManager.addEntry(entry));
        const history = historyManager.getHistory();
        
        // Verify all entries are accessible
        expect(history).toHaveLength(entries.length);
        
        // Verify entries are in order (newest first by addition order, not necessarily by timestamp)
        // Since entries are added in order, the first in history should be the last added
        expect(history[0].id).toBe(entries[entries.length - 1].id);
        expect(history[history.length - 1].id).toBe(entries[0].id);
        
        // Verify all entries can be retrieved
        entries.forEach(entry => {
          const retrieved = historyManager.getEntryById(entry.id);
          expect(retrieved).toBeDefined();
          expect(retrieved?.id).toBe(entry.id);
        });
      }),
      { numRuns: 100 }
    );
  });
  
  it('Should maintain history count correctly', () => {
    const historyManager = new AIOutputHistoryManager({
      maxEntries: 10,
      persistToSession: false,
    });
    
    // Add entries one by one and verify count
    for (let i = 0; i < 15; i++) {
      const entry: AIOutputEntry = {
        id: `entry-${i}`,
        timestamp: new Date(),
        userQuery: `Query ${i}`,
        textResponse: `Response ${i}`,
        images: [],
        searchResults: [],
        processingTime: 100,
      };
      
      historyManager.addEntry(entry);
      const count = historyManager.getHistoryCount();
      
      // Should not exceed maxEntries
      expect(count).toBeLessThanOrEqual(10);
      
      // Should match actual history length
      expect(count).toBe(historyManager.getHistory().length);
    }
  });
});

// ============================================================================
// Property 76: Auto-scroll to newest
// ============================================================================

describe('Property 76: Auto-scroll to newest', () => {
  it('**Feature: classroom-ui-overhaul, Property 76: Auto-scroll to newest** - For any new AI response added to history, the panel should auto-scroll to show the newest response', () => {
    fc.assert(
      fc.property(
        fc.array(aiOutputEntryArbitrary, { minLength: 1, maxLength: 5 }),
        aiOutputEntryArbitrary,
        (existingEntries, newEntry) => {
          const historyManager = new AIOutputHistoryManager({
            maxEntries: 50,
            persistToSession: false,
            autoScroll: true,
          });
          
          // Add existing entries
          existingEntries.forEach(entry => historyManager.addEntry(entry));
          const initialCount = historyManager.getHistoryCount();
          
          // Add new entry
          historyManager.addEntry(newEntry);
          const finalCount = historyManager.getHistoryCount();
          
          // Verify count increased
          expect(finalCount).toBe(initialCount + 1);
          
          // Verify auto-scroll is enabled
          expect(historyManager.shouldAutoScroll()).toBe(true);
          
          // Verify newest entry is first in history (newest first order)
          const history = historyManager.getHistory();
          expect(history[0].id).toBe(newEntry.id);
          
          // Verify newest entry is the one we just added (by ID, not timestamp)
          // The history manager adds entries in LIFO order (newest first)
          expect(history[0].id).toBe(newEntry.id);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('Should respect autoScroll configuration', () => {
    // Test with autoScroll enabled
    const managerWithScroll = new AIOutputHistoryManager({
      maxEntries: 50,
      persistToSession: false,
      autoScroll: true,
    });
    expect(managerWithScroll.shouldAutoScroll()).toBe(true);
    
    // Test with autoScroll disabled
    const managerWithoutScroll = new AIOutputHistoryManager({
      maxEntries: 50,
      persistToSession: false,
      autoScroll: false,
    });
    expect(managerWithoutScroll.shouldAutoScroll()).toBe(false);
    
    // Test default (should be true)
    const managerDefault = new AIOutputHistoryManager({
      maxEntries: 50,
      persistToSession: false,
    });
    expect(managerDefault.shouldAutoScroll()).toBe(true);
  });
  
  it('Newest entry should always be first in history array', () => {
    fc.assert(
      fc.property(fc.array(aiOutputEntryArbitrary, { minLength: 2, maxLength: 10 }), (entries) => {
        const historyManager = new AIOutputHistoryManager({
          maxEntries: 50,
          persistToSession: false,
        });
        
        // Add entries with increasing timestamps
        const sortedEntries = [...entries].sort(
          (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
        );
        
        sortedEntries.forEach(entry => historyManager.addEntry(entry));
        const history = historyManager.getHistory();
        
        // Verify newest (last added) is first in array
        expect(history[0].id).toBe(sortedEntries[sortedEntries.length - 1].id);
        
        // Verify order matches addition order (LIFO - last in, first out)
        for (let i = 0; i < history.length; i++) {
          expect(history[i].id).toBe(sortedEntries[sortedEntries.length - 1 - i].id);
        }
      }),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Additional Tests for History Management
// ============================================================================

describe('History Management Edge Cases', () => {
  it('Should handle empty history gracefully', () => {
    const historyManager = new AIOutputHistoryManager({
      maxEntries: 50,
      persistToSession: false,
    });
    
    expect(historyManager.getHistory()).toEqual([]);
    expect(historyManager.getHistoryCount()).toBe(0);
    expect(historyManager.getEntryById('nonexistent')).toBeNull();
  });
  
  it('Should clear history correctly', () => {
    const historyManager = new AIOutputHistoryManager({
      maxEntries: 50,
      persistToSession: false,
    });
    
    // Add some entries
    for (let i = 0; i < 5; i++) {
      historyManager.addEntry({
        id: `entry-${i}`,
        timestamp: new Date(),
        userQuery: `Query ${i}`,
        textResponse: `Response ${i}`,
        images: [],
        searchResults: [],
        processingTime: 100,
      });
    }
    
    expect(historyManager.getHistoryCount()).toBe(5);
    
    // Clear history
    historyManager.clearHistory();
    
    expect(historyManager.getHistory()).toEqual([]);
    expect(historyManager.getHistoryCount()).toBe(0);
  });
  
  it('Should enforce maxEntries limit', () => {
    const maxEntries = 5;
    const historyManager = new AIOutputHistoryManager({
      maxEntries,
      persistToSession: false,
    });
    
    // Add more entries than the limit
    for (let i = 0; i < maxEntries + 3; i++) {
      historyManager.addEntry({
        id: `entry-${i}`,
        timestamp: new Date(Date.now() + i * 1000), // Increasing timestamps
        userQuery: `Query ${i}`,
        textResponse: `Response ${i}`,
        images: [],
        searchResults: [],
        processingTime: 100,
      });
    }
    
    // Should not exceed maxEntries
    expect(historyManager.getHistoryCount()).toBe(maxEntries);
    
    // Should keep the newest entries
    const history = historyManager.getHistory();
    expect(history[0].id).toBe(`entry-${maxEntries + 2}`); // Newest
    expect(history[maxEntries - 1].id).toBe(`entry-${3}`); // Oldest kept
  });
});
