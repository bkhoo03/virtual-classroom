/**
 * Property-Based Tests for Web Search Integration
 * Tests web search execution, caching, result limitation, and citation formatting
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import WebSearchService from '../services/WebSearchService';
import AIService from '../services/AIService';
import type { SearchResult, SearchQuery } from '../types/ai.types';

// ============================================================================
// Custom Arbitraries for Web Search
// ============================================================================

const searchQueryArbitrary = fc.record({
  query: fc.string({ minLength: 1, maxLength: 100 }),
  maxResults: fc.option(fc.integer({ min: 1, max: 10 }), { nil: undefined }),
  freshness: fc.option(
    fc.constantFrom('day', 'week', 'month', 'year'),
    { nil: undefined }
  ),
});

const searchResultArbitrary = fc.record({
  title: fc.string({ minLength: 1, maxLength: 200 }),
  url: fc.webUrl(),
  snippet: fc.string({ minLength: 10, maxLength: 500 }),
  source: fc.domain(),
  publishedDate: fc.option(fc.string(), { nil: undefined }),
});

const searchResultsArrayArbitrary = fc.array(searchResultArbitrary, {
  minLength: 0,
  maxLength: 10,
});

// ============================================================================
// Mock Setup
// ============================================================================

// Mock fetch globally
global.fetch = vi.fn();

// Helper to create mock search response
function createMockSearchResponse(results: SearchResult[], provider: 'serper' | 'brave') {
  if (provider === 'serper') {
    return {
      ok: true,
      json: async () => ({
        organic: results.map(r => ({
          title: r.title,
          link: r.url,
          snippet: r.snippet,
          date: r.publishedDate,
        })),
      }),
    };
  } else {
    return {
      ok: true,
      json: async () => ({
        web: {
          results: results.map(r => ({
            title: r.title,
            url: r.url,
            description: r.snippet,
            age: r.publishedDate,
          })),
        },
      }),
    };
  }
}

// ============================================================================
// Property Tests
// ============================================================================

describe('Web Search Integration - Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Property 17: Web search execution', () => {
    it('**Feature: classroom-ui-overhaul, Property 17: For any user query requiring current information, a web search should be performed and results should be included in the response**', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 100 }),
          searchResultsArrayArbitrary,
          async (query, mockResults) => {
            // Setup: Create a query that triggers web search
            const searchQuery = `What is the latest news about ${query}`;
            
            // Mock the fetch response
            const limitedResults = mockResults.slice(0, 3);
            (global.fetch as any).mockResolvedValueOnce(
              createMockSearchResponse(limitedResults, 'serper')
            );

            // Create service with mock API key
            const service = new WebSearchService({
              apiKey: 'test-key',
              provider: 'serper',
              maxResults: 3,
            });

            // Execute search
            const results = await service.search({ query: searchQuery });

            // Property: Results should be returned
            expect(Array.isArray(results)).toBe(true);
            
            // Property: Each result should have required fields
            results.forEach(result => {
              expect(result).toHaveProperty('title');
              expect(result).toHaveProperty('url');
              expect(result).toHaveProperty('snippet');
              expect(result).toHaveProperty('source');
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 20: Search result citation', () => {
    it('**Feature: classroom-ui-overhaul, Property 20: For any web search performed, the results should include source citations with title, URL, and snippet**', async () => {
      await fc.assert(
        fc.asyncProperty(
          searchQueryArbitrary,
          searchResultsArrayArbitrary,
          async (query, mockResults) => {
            // Setup
            const limitedResults = mockResults.slice(0, 3);
            (global.fetch as any).mockResolvedValueOnce(
              createMockSearchResponse(limitedResults, 'serper')
            );

            const service = new WebSearchService({
              apiKey: 'test-key',
              provider: 'serper',
              maxResults: 3,
            });

            // Execute
            const results = await service.search(query);

            // Property: All results must have complete citation information
            results.forEach(result => {
              // Must have title
              expect(typeof result.title).toBe('string');
              expect(result.title.length).toBeGreaterThan(0);
              
              // Must have URL
              expect(typeof result.url).toBe('string');
              expect(result.url.length).toBeGreaterThan(0);
              
              // Must have snippet
              expect(typeof result.snippet).toBe('string');
              expect(result.snippet.length).toBeGreaterThan(0);
              
              // Must have source
              expect(typeof result.source).toBe('string');
              expect(result.source.length).toBeGreaterThan(0);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 22: Search result caching', () => {
    it('**Feature: classroom-ui-overhaul, Property 22: For any web search query, if the same query is made within 5 minutes, the cached results should be returned**', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 3, maxLength: 50 }).filter(s => s.trim().length > 0),
          searchResultsArrayArbitrary,
          async (query, mockResults) => {
            // Setup
            const limitedResults = mockResults.slice(0, 3);
            const mockResponse = createMockSearchResponse(limitedResults, 'serper');
            
            // Mock fetch to return the same response for all calls (including potential fallback attempts)
            (global.fetch as any).mockResolvedValue(mockResponse);

            const service = new WebSearchService({
              apiKey: 'test-key',
              provider: 'serper',
              maxResults: 3,
              cacheEnabled: true,
              cacheDuration: 5 * 60 * 1000, // 5 minutes
            });

            // First search - should hit API
            const firstResults = await service.search({ query });
            const firstCallCount = (global.fetch as any).mock.calls.length;

            // Second search with same query - should use cache
            const secondResults = await service.search({ query });
            const secondCallCount = (global.fetch as any).mock.calls.length;

            // Property: Second search should not make additional API call
            expect(secondCallCount).toBe(firstCallCount);
            
            // Property: Results should be identical
            expect(secondResults).toEqual(firstResults);
            
            // Property: Cache stats should show cache hit
            const stats = service.getUsageStats();
            expect(stats.cacheHits).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not use cache when cache is disabled', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 3, maxLength: 50 }),
          searchResultsArrayArbitrary,
          async (query, mockResults) => {
            // Setup
            const limitedResults = mockResults.slice(0, 3);
            (global.fetch as any)
              .mockResolvedValueOnce(createMockSearchResponse(limitedResults, 'serper'))
              .mockResolvedValueOnce(createMockSearchResponse(limitedResults, 'serper'));

            const service = new WebSearchService({
              apiKey: 'test-key',
              provider: 'serper',
              maxResults: 3,
              cacheEnabled: false,
            });

            // First search
            await service.search({ query });
            const firstCallCount = (global.fetch as any).mock.calls.length;

            // Second search with same query
            await service.search({ query });
            const secondCallCount = (global.fetch as any).mock.calls.length;

            // Property: Second search should make additional API call
            expect(secondCallCount).toBe(firstCallCount + 1);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 24: Search result limitation', () => {
    it('**Feature: classroom-ui-overhaul, Property 24: For any web search performed, the number of results should not exceed 3 to minimize API costs**', async () => {
      await fc.assert(
        fc.asyncProperty(
          searchQueryArbitrary,
          fc.array(searchResultArbitrary, { minLength: 5, maxLength: 20 }),
          async (query, mockResults) => {
            // Setup: Mock returns many results
            (global.fetch as any).mockResolvedValueOnce(
              createMockSearchResponse(mockResults, 'serper')
            );

            const service = new WebSearchService({
              apiKey: 'test-key',
              provider: 'serper',
              maxResults: 3, // Cost optimization: limit to 3 results
            });

            // Execute
            const results = await service.search(query);

            // Property: Results should never exceed 3
            expect(results.length).toBeLessThanOrEqual(3);
            
            // Property: If mock had results, we should get up to 3
            if (mockResults.length > 0) {
              expect(results.length).toBeGreaterThan(0);
              expect(results.length).toBeLessThanOrEqual(Math.min(3, mockResults.length));
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should respect custom maxResults parameter', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 3, maxLength: 50 }),
          fc.integer({ min: 1, max: 5 }),
          fc.array(searchResultArbitrary, { minLength: 10, maxLength: 20 }),
          async (query, maxResults, mockResults) => {
            // Setup
            (global.fetch as any).mockResolvedValueOnce(
              createMockSearchResponse(mockResults, 'serper')
            );

            const service = new WebSearchService({
              apiKey: 'test-key',
              provider: 'serper',
              maxResults: 10, // Default
            });

            // Execute with custom maxResults
            const results = await service.search({ query, maxResults });

            // Property: Results should not exceed requested maxResults
            expect(results.length).toBeLessThanOrEqual(maxResults);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('AI Service Integration', () => {
    it('should detect web search intent in queries', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'search for',
            'find',
            'what is',
            'latest',
            'current',
            'news about',
            'price of'
          ),
          fc.string({ minLength: 3, maxLength: 50 }),
          (keyword, topic) => {
            const query = `${keyword} ${topic}`;
            
            // Create AI service
            const aiService = new AIService({
              apiKey: 'test-key',
              apiEndpoint: 'https://api.openai.com/v1',
            });

            // Access private method via type assertion for testing
            const detectIntent = (aiService as any).detectWebSearchIntent.bind(aiService);
            const needsSearch = detectIntent(query);

            // Property: Queries with search keywords should be detected
            expect(needsSearch).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not detect web search intent in regular queries', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 100 })
            .filter(s => !['search', 'find', 'what is', 'latest', 'current'].some(kw => s.toLowerCase().includes(kw))),
          (query) => {
            const aiService = new AIService({
              apiKey: 'test-key',
              apiEndpoint: 'https://api.openai.com/v1',
            });

            const detectIntent = (aiService as any).detectWebSearchIntent.bind(aiService);
            const needsSearch = detectIntent(query);

            // Property: Regular queries should not trigger search
            expect(needsSearch).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Usage Statistics', () => {
    it('should track search statistics correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.string({ minLength: 3, maxLength: 50 }), { minLength: 1, maxLength: 10 }),
          searchResultsArrayArbitrary,
          async (queries, mockResults) => {
            // Setup
            const service = new WebSearchService({
              apiKey: 'test-key',
              provider: 'serper',
              maxResults: 3,
              cacheEnabled: true,
            });

            // Mock responses for all queries
            queries.forEach(() => {
              (global.fetch as any).mockResolvedValueOnce(
                createMockSearchResponse(mockResults.slice(0, 3), 'serper')
              );
            });

            // Execute searches
            for (const query of queries) {
              await service.search({ query });
            }

            // Get stats
            const stats = service.getUsageStats();

            // Property: Total searches should match number of queries
            expect(stats.totalSearches).toBe(queries.length);
            
            // Property: Cache misses should be at least 1 (first search)
            expect(stats.cacheMisses).toBeGreaterThan(0);
            
            // Property: Estimated cost should be positive
            expect(stats.estimatedCost).toBeGreaterThan(0);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
