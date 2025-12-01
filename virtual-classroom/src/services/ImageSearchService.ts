import type {
  ImageSearchConfig,
  ImageSearchQuery,
  UnsplashImage,
  ImageSearchUsageStats,
  AIError,
} from '../types/ai.types';

/**
 * ImageSearchService provides image search capabilities using Unsplash API
 * Implements caching with configurable TTL for performance optimization
 * Preferred over DALL-E for cost savings (Unsplash is free)
 */
class ImageSearchService {
  private apiKey: string;
  private maxResults: number;
  private cacheEnabled: boolean;
  private cacheDuration: number;
  private cache: Map<string, { results: UnsplashImage[]; timestamp: number }>;
  private usageStats: ImageSearchUsageStats;
  private readonly UNSPLASH_ENDPOINT = 'https://api.unsplash.com/search/photos';

  constructor(config: ImageSearchConfig) {
    this.apiKey = config.apiKey;
    this.maxResults = config.maxResults || 3;
    this.cacheEnabled = config.cacheEnabled !== false;
    this.cacheDuration = config.cacheDuration || 10 * 60 * 1000; // 10 minutes default
    this.cache = new Map();
    this.usageStats = {
      totalSearches: 0,
      cacheHits: 0,
      cacheMisses: 0,
    };
  }

  /**
   * Initialize the image search service with environment variables
   */
  static initialize(): ImageSearchService {
    const unsplashKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

    if (!unsplashKey) {
      throw new Error('Unsplash API configuration is missing. Please set VITE_UNSPLASH_ACCESS_KEY.');
    }

    return new ImageSearchService({
      apiKey: unsplashKey,
      maxResults: 3,
      cacheEnabled: true,
      cacheDuration: 10 * 60 * 1000,
    });
  }

  /**
   * Generate cache key for an image search query
   */
  private generateCacheKey(query: ImageSearchQuery): string {
    return `image-search-${query.query}-${query.maxResults || this.maxResults}-${query.orientation || 'any'}`;
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
   * Get cached image search results if available and not expired
   */
  getCachedResult(query: string): UnsplashImage[] | null {
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
   * Search for images using Unsplash API
   */
  async searchImages(query: ImageSearchQuery): Promise<UnsplashImage[]> {
    // Check cache first
    const cached = this.getCachedResult(query.query);
    if (cached) {
      console.log('Using cached image search results');
      // Apply maxResults limit to cached results - enforce the service's configured maximum
      const maxResults = Math.min(query.maxResults || this.maxResults, this.maxResults);
      return cached.slice(0, maxResults);
    }

    this.usageStats.cacheMisses++;
    this.usageStats.totalSearches++;

    // Build query parameters
    const params = new URLSearchParams({
      query: query.query,
      per_page: String(Math.min(query.maxResults || this.maxResults, this.maxResults)),
    });

    if (query.orientation) {
      params.append('orientation', query.orientation);
    }

    try {
      const response = await fetch(`${this.UNSPLASH_ENDPOINT}?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Client-ID ${this.apiKey}`,
          'Accept-Version': 'v1',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.createError(
          'UNSPLASH_API_ERROR',
          errorData.errors?.[0] || `Unsplash API error: ${response.status}`,
          response.status >= 500
        );
      }

      const data = await response.json();

      // Transform Unsplash response to our format
      const maxResults = Math.min(query.maxResults || this.maxResults, this.maxResults);
      const results: UnsplashImage[] = (data.results || [])
        .slice(0, maxResults)
        .map((item: any) => ({
          id: item.id,
          url: item.urls.regular,
          thumbnailUrl: item.urls.thumb,
          description: item.description || item.alt_description || '',
          photographer: item.user.name,
          photographerUrl: item.user.links.html,
          unsplashUrl: item.links.html,
          width: item.width,
          height: item.height,
        }));

      // Cache results (including empty results to avoid repeated API calls)
      if (this.cacheEnabled) {
        const cacheKey = this.generateCacheKey(query);
        this.cache.set(cacheKey, {
          results,
          timestamp: Date.now(),
        });
      }

      return results;
    } catch (error) {
      if ((error as AIError).code) {
        throw error;
      }
      throw this.createError(
        'NETWORK_ERROR',
        `Failed to search images: ${(error as Error).message}`,
        true
      );
    }
  }

  /**
   * Clear all cached image search results
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): ImageSearchUsageStats {
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
    };
  }
}

export default ImageSearchService;
