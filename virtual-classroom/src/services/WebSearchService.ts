import type {
  WebSearchConfig,
  SearchQuery,
  SearchResult,
  WebSearchUsageStats,
  AIError,
} from '../types/ai.types';

/**
 * WebSearchService provides fast, cost-effective web search capabilities
 * Supports Serper API (primary) with fallback to Brave Search API
 * Implements caching with configurable TTL for cost optimization
 */
class WebSearchService {
  private apiKey: string;
  private provider: 'serper' | 'brave' | 'bing';
  private maxResults: number;
  private cacheEnabled: boolean;
  private cacheDuration: number;
  private cache: Map<string, { results: SearchResult[]; timestamp: number }>;
  private usageStats: WebSearchUsageStats;
  private readonly SERPER_ENDPOINT = 'https://google.serper.dev/search';
  private readonly BRAVE_ENDPOINT = 'https://api.search.brave.com/res/v1/web/search';
  private readonly COST_PER_SEARCH = 0.001; // Estimated cost per search in USD

  constructor(config: WebSearchConfig) {
    this.apiKey = config.apiKey;
    this.provider = config.provider;
    this.maxResults = config.maxResults || 3;
    this.cacheEnabled = config.cacheEnabled !== false;
    this.cacheDuration = config.cacheDuration || 5 * 60 * 1000; // 5 minutes default
    this.cache = new Map();
    this.usageStats = {
      totalSearches: 0,
      cacheHits: 0,
      cacheMisses: 0,
      estimatedCost: 0,
    };
  }

  /**
   * Initialize the web search service with environment variables
   */
  static initialize(): WebSearchService {
    const serperKey = import.meta.env.VITE_SERPER_API_KEY;
    const braveKey = import.meta.env.VITE_BRAVE_API_KEY;

    // Prefer Serper, fallback to Brave
    if (serperKey) {
      return new WebSearchService({
        apiKey: serperKey,
        provider: 'serper',
        maxResults: 3,
        cacheEnabled: true,
        cacheDuration: 5 * 60 * 1000,
      });
    } else if (braveKey) {
      return new WebSearchService({
        apiKey: braveKey,
        provider: 'brave',
        maxResults: 3,
        cacheEnabled: true,
        cacheDuration: 5 * 60 * 1000,
      });
    }

    throw new Error('Web search API configuration is missing. Please set VITE_SERPER_API_KEY or VITE_BRAVE_API_KEY.');
  }

  /**
   * Generate cache key for a search query
   */
  private generateCacheKey(query: SearchQuery): string {
    return `search-${this.provider}-${query.query}-${query.maxResults || this.maxResults}-${query.freshness || 'any'}`;
  }

  /**
   * Clean expired cache entries
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheDuration) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cached search results if available and not expired
   */
  getCachedResult(query: string): SearchResult[] | null {
    if (!this.cacheEnabled) {
      return null;
    }

    this.cleanExpiredCache();

    const cacheKey = this.generateCacheKey({ query });
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      this.usageStats.cacheHits++;
      return cached.results;
    }

    return null;
  }

  /**
   * Create a standardized error object
   */
  private createError(code: string, message: string, retryable: boolean): AIError {
    return { code, message, retryable };
  }

  /**
   * Search using Serper API
   */
  private async searchWithSerper(query: SearchQuery): Promise<SearchResult[]> {
    const response = await fetch(this.SERPER_ENDPOINT, {
      method: 'POST',
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query.query,
        num: query.maxResults || this.maxResults,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw this.createError(
        'SERPER_API_ERROR',
        errorData.message || `Serper API error: ${response.status}`,
        response.status >= 500
      );
    }

    const data = await response.json();
    
    // Serper returns results in 'organic' array
    // Enforce the service's configured maximum
    const maxResults = Math.min(query.maxResults || this.maxResults, this.maxResults);
    const results: SearchResult[] = (data.organic || [])
      .slice(0, maxResults)
      .map((item: any) => ({
        title: item.title || '',
        url: item.link || '',
        snippet: item.snippet || '',
        source: new URL(item.link || '').hostname,
        publishedDate: item.date,
      }));

    return results;
  }

  /**
   * Search using Brave Search API
   */
  private async searchWithBrave(query: SearchQuery): Promise<SearchResult[]> {
    const params = new URLSearchParams({
      q: query.query,
      count: String(query.maxResults || this.maxResults),
    });

    if (query.freshness) {
      params.append('freshness', query.freshness);
    }

    const response = await fetch(`${this.BRAVE_ENDPOINT}?${params}`, {
      method: 'GET',
      headers: {
        'X-Subscription-Token': this.apiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw this.createError(
        'BRAVE_API_ERROR',
        errorData.message || `Brave API error: ${response.status}`,
        response.status >= 500
      );
    }

    const data = await response.json();
    
    // Brave returns results in 'web.results' array
    // Enforce the service's configured maximum
    const maxResults = Math.min(query.maxResults || this.maxResults, this.maxResults);
    const results: SearchResult[] = (data.web?.results || [])
      .slice(0, maxResults)
      .map((item: any) => ({
        title: item.title || '',
        url: item.url || '',
        snippet: item.description || '',
        source: new URL(item.url || '').hostname,
        publishedDate: item.age,
      }));

    return results;
  }

  /**
   * Perform a web search with caching and fallback support
   */
  async search(query: SearchQuery): Promise<SearchResult[]> {
    // Check cache first
    const cached = this.getCachedResult(query.query);
    if (cached) {
      console.log('Using cached search results');
      // Apply maxResults limit to cached results - enforce the service's configured maximum
      const maxResults = Math.min(query.maxResults || this.maxResults, this.maxResults);
      return cached.slice(0, maxResults);
    }

    this.usageStats.cacheMisses++;
    this.usageStats.totalSearches++;
    this.usageStats.estimatedCost += this.COST_PER_SEARCH;

    let results: SearchResult[];

    try {
      // Try primary provider
      if (this.provider === 'serper') {
        results = await this.searchWithSerper(query);
      } else if (this.provider === 'brave') {
        results = await this.searchWithBrave(query);
      } else {
        throw this.createError(
          'UNSUPPORTED_PROVIDER',
          `Unsupported search provider: ${this.provider}`,
          false
        );
      }
    } catch (error) {
      // Try fallback if primary fails
      console.warn(`Primary search provider (${this.provider}) failed, attempting fallback...`);
      
      if (this.provider === 'serper') {
        // Try Brave as fallback
        const braveKey = import.meta.env.VITE_BRAVE_API_KEY;
        if (braveKey) {
          const fallbackService = new WebSearchService({
            apiKey: braveKey,
            provider: 'brave',
            maxResults: this.maxResults,
            cacheEnabled: false, // Don't cache fallback results
          });
          results = await fallbackService.searchWithBrave(query);
        } else {
          throw error;
        }
      } else {
        // No fallback available
        throw error;
      }
    }

    // Apply maxResults limit - enforce the service's configured maximum
    // Never exceed the service's maxResults, even if query requests more
    const maxResults = Math.min(query.maxResults || this.maxResults, this.maxResults);
    results = results.slice(0, maxResults);

    // Cache results (including empty results to avoid repeated API calls)
    if (this.cacheEnabled) {
      const cacheKey = this.generateCacheKey(query);
      this.cache.set(cacheKey, {
        results,
        timestamp: Date.now(),
      });
    }

    return results;
  }

  /**
   * Clear all cached search results
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): WebSearchUsageStats {
    return { ...this.usageStats };
  }

  /**
   * Reset usage statistics
   */
  resetUsageStats(): void {
    this.usageStats = {
      totalSearches: 0,
      cacheHits: 0,
      cacheMisses: 0,
      estimatedCost: 0,
    };
  }
}

export default WebSearchService;
