import AIService from './AIService';
import WebSearchService from './WebSearchService';
import ImageSearchService from './ImageSearchService';
import ImageGenerationService from './ImageGenerationService';
import type {
  OrchestratorConfig,
  MultimodalRequest,
  MultimodalResult,
  IntentDetectionResult,
  PerformanceMetrics,
  AIMessage,
  SearchResult,
  UnsplashImage,
  GeneratedImage,
  AIError,
} from '../types/ai.types';

/**
 * MultimodalAIOrchestrator coordinates text, web search, image search, and image generation
 * in a single AI response with proactive image enhancement.
 * 
 * Key features:
 * - Smart intent detection for query analysis
 * - Proactive image enhancement (AI determines when images would help)
 * - Prefer Unsplash over DALL-E for cost savings
 * - Parallel execution of services
 * - Graceful degradation if services fail
 * - Cost tracking and performance monitoring
 */
class MultimodalAIOrchestrator {
  private aiService: AIService;
  private webSearchService: WebSearchService | null;
  private imageSearchService: ImageSearchService | null;
  private imageGenService: ImageGenerationService | null;
  private enableSmartDetection: boolean;
  private enableProactiveImages: boolean;
  private preferUnsplash: boolean;
  private maxSearchResults: number;
  private maxImages: number;
  private cache: Map<string, { result: MultimodalResult; timestamp: number }>;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private performanceMetrics: PerformanceMetrics;
  private requestQueue: Array<{ request: MultimodalRequest; resolve: (result: MultimodalResult) => void; reject: (error: Error) => void }>;
  private isProcessingQueue: boolean;
  private readonly MAX_CONCURRENT_REQUESTS = 3;
  private activeRequests: number;

  constructor(config: OrchestratorConfig) {
    this.aiService = config.aiService;
    this.webSearchService = config.webSearchService;
    this.imageSearchService = config.imageSearchService;
    this.imageGenService = config.imageGenService;
    this.enableSmartDetection = config.enableSmartDetection !== false;
    this.enableProactiveImages = config.enableProactiveImages !== false;
    this.preferUnsplash = config.preferUnsplash !== false;
    this.maxSearchResults = config.maxSearchResults || 3;
    this.maxImages = config.maxImages || 3;
    this.cache = new Map();
    this.requestQueue = [];
    this.isProcessingQueue = false;
    this.activeRequests = 0;
    this.performanceMetrics = {
      averageResponseTime: 0,
      averageCost: 0,
      successRate: 100,
      unsplashUsagePercent: 0,
      dalleUsagePercent: 0,
      totalRequests: 0,
      failedRequests: 0,
    };
  }

  /**
   * Initialize the orchestrnt variables
   */
  static initialize(): MultimodalAIOrchestrator {
    const aiService = AIService.initialize();
    
    let webSearchService: WebSearchService | null = null;
    try {
      webSearchService = WebSearchService.initialize();
    } catch (error) {
      console.warn('Web search service not available:', error);
    }

    let imageSearchService: ImageSearchService | null = null;
    try {
      imageSearchService = ImageSearchService.initialize();
    } catch (error) {
      console.warn('Image search service not available:', error);
    }

    let imageGenService: ImageGenerationService | null = null;
    try {
      imageGenService = ImageGenerationService.initialize();
    } catch (error) {
      console.warn('Image generation service not available:', error);
    }

    return new MultimodalAIOrchestrator({
      aiService,
      webSearchService,
      imageSearchService,
      imageGenService,
      enableSmartDetection: true,
      enableProactiveImages: true,
      preferUnsplash: true,
      maxSearchResults: 3,
      maxImages: 3,
    });
  }

  /**
   * Generate cache key for a request
   */
  private generateCacheKey(request: MultimodalRequest): string {
    const messagesStr = JSON.stringify(request.conversationHistory.map(m => ({ role: m.role, content: m.content })));
    const optionsStr = JSON.stringify({
      forceWebSearch: request.forceWebSearch,
      forceImageSearch: request.forceImageSearch,
      forceImageGen: request.forceImageGen,
    });
    return `multimodal-${messagesStr}-${optionsStr}`;
  }

  /**
   * Clean expired cache entries
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Create a standardized error object
   */
  private createError(code: string, message: string, retryable: boolean): AIError {
    return { code, message, retryable };
  }

  /**
   * Detect intent from user message and AI response
   */
  private detectIntent(message: string, aiResponse?: string): IntentDetectionResult {
    const lowerMessage = message.toLowerCase();
    const lowerResponse = aiResponse?.toLowerCase() || '';

    // Web search keywords
    const searchKeywords = [
      'search', 'find', 'look up', 'what is', 'who is', 'when did', 'where is',
      'current', 'latest', 'recent', 'news', 'today', 'now', 'happening',
      'price of', 'weather', 'stock', 'score', 'result',
    ];

    // Image generation keywords (explicit request)
    const generationKeywords = [
      'generate', 'create', 'draw', 'make', 'design', 'imagine',
      'visualize', 'render', 'produce', 'paint', 'sketch', 'illustrate',
      'generate an image', 'generate a picture', 'generate image',
      'create an image', 'create a picture', 'create image',
      'draw me', 'draw an', 'draw a',
    ];

    // Image search keywords (proactive enhancement)
    const imageKeywords = [
      'show', 'photo', 'visual', 'look like', 'appearance',
      'diagram', 'illustration', 'example of', 'what does', 'how does',
    ];

    // Visual concepts (for proactive image enhancement)
    const visualConcepts = [
      'animal', 'plant', 'building', 'landscape', 'person', 'object',
      'place', 'location', 'city', 'country', 'monument', 'artwork',
      'scientific', 'historical', 'geographic', 'educational',
      'species', 'architecture', 'nature', 'culture', 'technology',
    ];

    // Skip image concepts (abstract, code, math)
    const skipImageConcepts = [
      'code', 'programming', 'function', 'algorithm', 'math', 'equation',
      'formula', 'abstract', 'concept', 'theory', 'philosophy',
      'calculate', 'compute', 'solve', 'debug',
    ];

    // Detect web search intent
    const needsWebSearch = searchKeywords.some(keyword => lowerMessage.includes(keyword));

    // Detect image generation intent (explicit request)
    const needsImageGeneration = generationKeywords.some(keyword => lowerMessage.includes(keyword));

    // Detect image search intent (proactive enhancement)
    // Don't trigger if image generation is requested or if skip concepts are present
    const hasSkipConcept = skipImageConcepts.some(concept => 
      lowerMessage.includes(concept) || lowerResponse.includes(concept)
    );
    
    const hasImageKeyword = imageKeywords.some(keyword => lowerMessage.includes(keyword));
    const hasVisualConcept = visualConcepts.some(concept => 
      lowerMessage.includes(concept) || lowerResponse.includes(concept)
    );
    
    const needsImages = !needsImageGeneration && !hasSkipConcept && (hasImageKeyword || hasVisualConcept);

    // Extract image queries
    const imageQueries: string[] = [];
    if (needsImages || needsImageGeneration) {
      // Extract the main subject from user message
      const cleanedMessage = message
        .toLowerCase()
        .replace(/^(what is|what are|who is|who are|tell me about|show me|explain|describe)\s+/i, '')
        .replace(/^(a|an|the)\s+/i, '')
        .trim();

      if (cleanedMessage.length > 2) {
        imageQueries.push(cleanedMessage);
      } else {
        // Fallback to full message
        imageQueries.push(message.substring(0, 100));
      }

      // Extract key nouns from AI response (if available)
      if (aiResponse) {
        const sentences = aiResponse.split(/[.!?]+/);
        const capitalizedWords = new Set<string>();
        
        sentences.forEach(sentence => {
          const words = sentence.trim().split(/\s+/);
          // Skip first word (sentence start) and look for capitalized words
          words.slice(1).forEach(word => {
            const cleaned = word.replace(/[^a-zA-Z]/g, '');
            if (cleaned.length > 3 && /^[A-Z][a-z]+$/.test(cleaned)) {
              capitalizedWords.add(cleaned);
            }
          });
        });

        // Add up to 2 additional concepts
        const additionalConcepts = Array.from(capitalizedWords).slice(0, 2);
        imageQueries.push(...additionalConcepts);
      }
    }

    // Determine which service to use for images
    const shouldUseUnsplash = needsImages && this.preferUnsplash && this.imageSearchService !== null;
    const shouldUseDalle = needsImageGeneration || (needsImages && !shouldUseUnsplash);

    // Calculate confidence based on keyword matches
    let confidence = 0;
    if (needsWebSearch) confidence += 0.3;
    if (needsImageGeneration) confidence += 0.4;
    if (needsImages) confidence += 0.3;
    confidence = Math.min(confidence, 1.0);

    return {
      needsWebSearch,
      needsImages,
      needsImageGeneration,
      imageQueries: imageQueries.slice(0, this.maxImages),
      shouldUseUnsplash,
      shouldUseDalle,
      confidence,
    };
  }

  /**
   * Should enhance with images (proactive image detection)
   */
  private shouldEnhanceWithImages(userQuery: string, aiResponse: string): boolean {
    const intent = this.detectIntent(userQuery, aiResponse);
    return intent.needsImages && !intent.needsImageGeneration;
  }

  /**
   * Extract image queries from user query and AI response
   */
  private extractImageQueries(userQuery: string, aiResponse: string): string[] {
    const queries: string[] = [];

    // First, try to extract the main subject from the user query
    // Remove common question words and get the core subject
    const cleanedQuery = userQuery
      .toLowerCase()
      .replace(/^(what is|what are|who is|who are|tell me about|show me|explain|describe)\s+/i, '')
      .replace(/^(a|an|the)\s+/i, '')
      .trim();

    if (cleanedQuery.length > 2) {
      queries.push(cleanedQuery);
    }

    // Extract key nouns from AI response (capitalized words that aren't at sentence start)
    if (aiResponse) {
      const sentences = aiResponse.split(/[.!?]+/);
      const capitalizedWords = new Set<string>();
      
      sentences.forEach(sentence => {
        const words = sentence.trim().split(/\s+/);
        // Skip first word (sentence start) and look for capitalized words
        words.slice(1).forEach(word => {
          const cleaned = word.replace(/[^a-zA-Z]/g, '');
          if (cleaned.length > 3 && /^[A-Z][a-z]+$/.test(cleaned)) {
            capitalizedWords.add(cleaned);
          }
        });
      });

      // Add up to 2 additional concepts from AI response
      const additionalConcepts = Array.from(capitalizedWords).slice(0, 2);
      queries.push(...additionalConcepts);
    }

    // Limit to 3 queries maximum
    return queries.slice(0, 3);
  }

  /**
   * Execute services in parallel with graceful degradation
   */
  private async executeParallel(
    textPromise: Promise<any>,
    searchPromise?: Promise<SearchResult[]>,
    imageSearchPromise?: Promise<UnsplashImage[]>,
    imageGenPromise?: Promise<GeneratedImage>
  ): Promise<{
    textResponse: any;
    searchResults: SearchResult[];
    images: UnsplashImage[];
    generatedImages: GeneratedImage[];
  }> {
    const results = await Promise.allSettled([
      textPromise,
      searchPromise || Promise.resolve([]),
      imageSearchPromise || Promise.resolve([]),
      imageGenPromise || Promise.resolve(null),
    ]);

    const textResponse = results[0].status === 'fulfilled' ? results[0].value : null;
    const searchResults = results[1].status === 'fulfilled' ? results[1].value : [];
    const images = results[2].status === 'fulfilled' ? results[2].value : [];
    const generatedImage = results[3].status === 'fulfilled' ? results[3].value : null;
    const generatedImages = generatedImage ? [generatedImage] : [];

    // Log any failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const serviceName = ['text', 'search', 'imageSearch', 'imageGen'][index];
        console.warn(`${serviceName} service failed:`, result.reason);
      }
    });

    return { textResponse, searchResults, images, generatedImages };
  }

  /**
   * Add request to queue if rate limit is reached
   */
  private async queueRequest(request: MultimodalRequest): Promise<MultimodalResult> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ request, resolve, reject });
      console.log(`⏳ Request queued. Queue length: ${this.requestQueue.length}`);
      this.processQueue();
    });
  }

  /**
   * Process the request queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0 && this.activeRequests < this.MAX_CONCURRENT_REQUESTS) {
      const item = this.requestQueue.shift();
      if (!item) break;

      this.activeRequests++;
      
      this.processRequestInternal(item.request)
        .then(result => {
          item.resolve(result);
          this.activeRequests--;
          this.processQueue(); // Process next item
        })
        .catch(error => {
          item.reject(error);
          this.activeRequests--;
          this.processQueue(); // Process next item
        });
    }

    this.isProcessingQueue = false;
  }

  /**
   * Process a multimodal request (public interface)
   */
  async processRequest(request: MultimodalRequest): Promise<MultimodalResult> {
    // Check if we should queue the request
    if (this.activeRequests >= this.MAX_CONCURRENT_REQUESTS) {
      console.log('⚠️ Rate limit reached, queueing request...');
      return this.queueRequest(request);
    }

    this.activeRequests++;
    try {
      const result = await this.processRequestInternal(request);
      return result;
    } finally {
      this.activeRequests--;
      this.processQueue(); // Process any queued requests
    }
  }

  /**
   * Internal method to process a multimodal request
   */
  private async processRequestInternal(request: MultimodalRequest): Promise<MultimodalResult> {
    const startTime = Date.now();
    this.performanceMetrics.totalRequests++;

    // Check cache first
    this.cleanExpiredCache();
    const cacheKey = this.generateCacheKey(request);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log('Using cached multimodal response');
      return {
        ...cached.result,
        metadata: {
          ...cached.result.metadata,
          cacheHits: cached.result.metadata.cacheHits + 1,
        },
      };
    }

    try {
      // Convert conversation history to AIMessage format
      const messages: AIMessage[] = [
        ...request.conversationHistory,
        {
          id: Date.now().toString(),
          role: 'user',
          content: request.userMessage,
          timestamp: new Date(),
        },
      ];

      // Detect intent
      const intent = this.detectIntent(request.userMessage);
      
      console.log('🎯 Intent detection:', {
        needsWebSearch: intent.needsWebSearch || request.forceWebSearch,
        needsImages: intent.needsImages || request.forceImageSearch,
        needsImageGeneration: intent.needsImageGeneration || request.forceImageGen,
        imageQueries: intent.imageQueries,
      });

      // Prepare promises for parallel execution
      let searchPromise: Promise<SearchResult[]> | undefined;
      let imageSearchPromise: Promise<UnsplashImage[]> | undefined;
      let imageGenPromise: Promise<GeneratedImage> | undefined;

      // Web search
      if ((intent.needsWebSearch || request.forceWebSearch) && this.webSearchService) {
        searchPromise = this.webSearchService.search({
          query: request.userMessage,
          maxResults: this.maxSearchResults,
        });
      }

      // Get AI response first (needed for proactive image enhancement)
      const aiResponse = await this.aiService.sendMessage(messages, {
        useCache: true,
      });
      const aiResponseText = aiResponse.choices[0]?.message?.content || '';

      // Re-detect intent with AI response for proactive image enhancement
      const enhancedIntent = this.detectIntent(request.userMessage, aiResponseText);

      // Image generation (explicit request)
      if ((enhancedIntent.needsImageGeneration || request.forceImageGen) && this.imageGenService) {
        const imagePrompt = enhancedIntent.imageQueries[0] || request.userMessage;
        imageGenPromise = this.imageGenService.generateImage({
          prompt: imagePrompt,
          size: '512x512',
        });
      }
      // Image search (proactive enhancement)
      else if ((enhancedIntent.needsImages || request.forceImageSearch) && 
               (request.enableProactiveImages !== false) && 
               this.enableProactiveImages) {
        // Prefer Unsplash
        if (this.preferUnsplash && this.imageSearchService) {
          const imageQuery = enhancedIntent.imageQueries[0] || request.userMessage;
          imageSearchPromise = this.imageSearchService.searchImages({
            query: imageQuery,
            maxResults: this.maxImages,
          });
        }
        // Fallback to DALL-E if Unsplash not available
        else if (this.imageGenService) {
          const imagePrompt = enhancedIntent.imageQueries[0] || request.userMessage;
          imageGenPromise = this.imageGenService.generateImage({
            prompt: imagePrompt,
            size: '512x512',
          });
        }
      }

      // Execute remaining promises in parallel
      const { searchResults, images, generatedImages } = await this.executeParallel(
        Promise.resolve(aiResponse),
        searchPromise,
        imageSearchPromise,
        imageGenPromise
      );

      // Calculate costs
      const textCost = (aiResponse.usage.total_tokens / 1000) * 0.002; // Approximate cost for GPT-3.5
      const searchCost = searchResults.length * 0.001; // Approximate cost per search
      const imageCost = generatedImages.length * 0.02; // DALL-E 2 cost
      const totalCost = textCost + searchCost + imageCost;

      // Determine image source
      let imageSource: 'unsplash' | 'dalle' | 'both' | 'none' = 'none';
      if (images.length > 0 && generatedImages.length > 0) {
        imageSource = 'both';
      } else if (images.length > 0) {
        imageSource = 'unsplash';
      } else if (generatedImages.length > 0) {
        imageSource = 'dalle';
      }

      // Build result
      const processingTime = Date.now() - startTime;
      const result: MultimodalResult = {
        textResponse: aiResponseText,
        images: [...images, ...generatedImages],
        searchResults,
        processingTime,
        cost: {
          text: textCost,
          images: imageCost,
          search: searchCost,
          total: totalCost,
        },
        imageSource,
        metadata: {
          textTokens: aiResponse.usage.total_tokens,
          imageGenerations: generatedImages.length,
          searchQueries: searchResults.length > 0 ? 1 : 0,
          cacheHits: 0,
        },
      };

      // Update performance metrics
      this.updatePerformanceMetrics(result, true);

      // Cache result
      this.cache.set(cacheKey, {
        result,
        timestamp: Date.now(),
      });

      // Check and log cost warnings
      this.checkCostWarning(totalCost);

      return result;
    } catch (error) {
      this.performanceMetrics.failedRequests++;
      this.updatePerformanceMetrics(null, false);
      
      throw this.createError(
        'ORCHESTRATION_ERROR',
        `Failed to process multimodal request: ${(error as Error).message}`,
        true
      );
    }
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(result: MultimodalResult | null, success: boolean): void {
    if (result) {
      // Update average response time
      const totalTime = this.performanceMetrics.averageResponseTime * (this.performanceMetrics.totalRequests - 1);
      this.performanceMetrics.averageResponseTime = (totalTime + result.processingTime) / this.performanceMetrics.totalRequests;

      // Update average cost
      const totalCost = this.performanceMetrics.averageCost * (this.performanceMetrics.totalRequests - 1);
      this.performanceMetrics.averageCost = (totalCost + result.cost.total) / this.performanceMetrics.totalRequests;

      // Update image source percentages
      if (result.imageSource === 'unsplash') {
        this.performanceMetrics.unsplashUsagePercent = 
          ((this.performanceMetrics.unsplashUsagePercent * (this.performanceMetrics.totalRequests - 1)) + 100) / 
          this.performanceMetrics.totalRequests;
      } else if (result.imageSource === 'dalle') {
        this.performanceMetrics.dalleUsagePercent = 
          ((this.performanceMetrics.dalleUsagePercent * (this.performanceMetrics.totalRequests - 1)) + 100) / 
          this.performanceMetrics.totalRequests;
      } else if (result.imageSource === 'both') {
        this.performanceMetrics.unsplashUsagePercent = 
          ((this.performanceMetrics.unsplashUsagePercent * (this.performanceMetrics.totalRequests - 1)) + 50) / 
          this.performanceMetrics.totalRequests;
        this.performanceMetrics.dalleUsagePercent = 
          ((this.performanceMetrics.dalleUsagePercent * (this.performanceMetrics.totalRequests - 1)) + 50) / 
          this.performanceMetrics.totalRequests;
      }
    }

    // Update success rate
    const successfulRequests = this.performanceMetrics.totalRequests - this.performanceMetrics.failedRequests;
    this.performanceMetrics.successRate = (successfulRequests / this.performanceMetrics.totalRequests) * 100;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Reset performance metrics
   */
  resetPerformanceMetrics(): void {
    this.performanceMetrics = {
      averageResponseTime: 0,
      averageCost: 0,
      successRate: 100,
      unsplashUsagePercent: 0,
      dalleUsagePercent: 0,
      totalRequests: 0,
      failedRequests: 0,
    };
  }

  /**
   * Get queue status
   */
  getQueueStatus(): {
    queueLength: number;
    activeRequests: number;
    isProcessing: boolean;
  } {
    return {
      queueLength: this.requestQueue.length,
      activeRequests: this.activeRequests,
      isProcessing: this.isProcessingQueue,
    };
  }

  /**
   * Check if cost is high and log warning
   */
  private checkCostWarning(cost: number): void {
    const threshold = 0.1; // $0.10 per request
    if (cost > threshold) {
      console.warn(`⚠️ High API cost detected: $${cost.toFixed(4)} (threshold: $${threshold})`);
    }

    // Check cumulative cost
    const cumulativeCost = this.performanceMetrics.averageCost * this.performanceMetrics.totalRequests;
    const cumulativeThreshold = 10.0; // $10 total
    if (cumulativeCost > cumulativeThreshold) {
      console.warn(`⚠️ High cumulative API cost: $${cumulativeCost.toFixed(2)} (threshold: $${cumulativeThreshold})`);
    }
  }
}

export default MultimodalAIOrchestrator;
