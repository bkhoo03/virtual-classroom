import requestCache from '../utils/requestCache';
import WebSearchService from './WebSearchService';
import ImageSearchService from './ImageSearchService';
import ImageGenerationService from './ImageGenerationService';
import errorLoggingService from './ErrorLoggingService';
import type {
  AIServiceConfig,
  ChatGPTRequest,
  ChatGPTResponse,
  ChatGPTStreamChunk,
  AIMessage,
  AIError,
  SearchResult,
  UnsplashImage,
  GeneratedImage,
} from '../types/ai.types';

/**
 * AIService handles communication with the OpenAI ChatGPT API
 * Implements authentication, request/response handling, rate limiting, error handling,
 * and request caching for optimized network usage
 */
class AIService {
  private apiKey: string;
  private apiEndpoint: string;
  private model: string;
  private maxRetries: number;
  private retryDelay: number;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minute
  private readonly MAX_REQUESTS_PER_WINDOW = 20;
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache for AI responses
  private webSearchService: WebSearchService | null = null;
  private imageSearchService: ImageSearchService | null = null;
  private imageGenService: ImageGenerationService | null = null;
  
  /**
   * System prompt that informs the AI about its capabilities
   * This prompt is prepended to all conversations to make the AI aware of
   * its access to Unsplash image search and DALL-E image generation
   */
  private readonly SYSTEM_PROMPT = `You are an AI teaching assistant in a virtual classroom. You have access to:
1. Web search - for current information and facts
2. Unsplash image search - for finding relevant stock photos and images
3. DALL-E image generation - for creating custom images

When answering questions, proactively use images when they would enhance understanding. For educational topics, scientific concepts, historical events, geographic locations, or visual subjects, automatically search for or generate relevant images without waiting for explicit requests.

Always mention when you're searching for or generating images to help illustrate your explanations.`;

  constructor(config: AIServiceConfig) {
    this.apiKey = config.apiKey;
    this.apiEndpoint = config.apiEndpoint;
    this.model = config.model || 'gpt-3.5-turbo';
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelay || 1000;
    
    // Initialize web search service if API key is available
    try {
      this.webSearchService = WebSearchService.initialize();
    } catch (error) {
      console.warn('Web search service not available:', error);
      this.webSearchService = null;
    }

    // Initialize image search service if API key is available
    try {
      this.imageSearchService = ImageSearchService.initialize();
    } catch (error) {
      console.warn('Image search service not available:', error);
      this.imageSearchService = null;
    }

    // Initialize image generation service if API key is available
    try {
      this.imageGenService = ImageGenerationService.initialize();
      console.log('✅ Image generation service initialized successfully');
    } catch (error) {
      console.warn('⚠️ Image generation service not available:', error);
      this.imageGenService = null;
    }
  }

  /**
   * Initialize the AI service with environment variables
   */
  static initialize(): AIService {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const apiEndpoint = import.meta.env.VITE_OPENAI_API_ENDPOINT || 'https://api.openai.com/v1';

    if (!apiKey) {
      throw new Error('OpenAI API configuration is missing. Please check environment variables.');
    }

    return new AIService({
      apiKey,
      apiEndpoint,
    });
  }

  /**
   * Check if rate limit is exceeded
   */
  private checkRateLimit(): void {
    const now = Date.now();
    
    // Reset counter if window has passed
    if (now - this.lastRequestTime > this.RATE_LIMIT_WINDOW) {
      this.requestCount = 0;
      this.lastRequestTime = now;
    }

    if (this.requestCount >= this.MAX_REQUESTS_PER_WINDOW) {
      const waitTime = this.RATE_LIMIT_WINDOW - (now - this.lastRequestTime);
      throw this.createError(
        'RATE_LIMIT_EXCEEDED',
        `Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`,
        false
      );
    }

    this.requestCount++;
  }

  /**
   * Create a standardized error object
   */
  private createError(code: string, message: string, retryable: boolean): AIError {
    return { code, message, retryable };
  }

  /**
   * Make an authenticated request to the OpenAI API
   */
  private async makeRequest(
    endpoint: string,
    body: ChatGPTRequest,
    _stream: boolean = false
  ): Promise<Response> {
    this.checkRateLimit();

    const url = `${this.apiEndpoint}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      
      // Determine if error is retryable based on OpenAI error codes
      // 429: Rate limit exceeded
      // 500-599: Server errors
      // 503: Service unavailable
      const retryable = response.status >= 500 || response.status === 429 || response.status === 503;
      
      // Map OpenAI error types to codes
      const errorCode = errorData.error?.type || errorData.error?.code || 'API_ERROR';
      
      throw this.createError(
        errorCode,
        errorMessage,
        retryable
      );
    }

    return response;
  }

  /**
   * Get the system prompt that informs the AI about its capabilities
   */
  getSystemPrompt(): string {
    return this.SYSTEM_PROMPT;
  }

  /**
   * Prepend system prompt to messages if not already present
   */
  private prependSystemPrompt(messages: AIMessage[]): AIMessage[] {
    // Check if first message is already a system message with our prompt
    if (messages.length > 0 && 
        messages[0].role === 'system' && 
        messages[0].content === this.SYSTEM_PROMPT) {
      return messages;
    }

    // Check if there's any system message at the start
    if (messages.length > 0 && messages[0].role === 'system') {
      // Replace existing system message with our prompt
      return [
        {
          id: 'system-prompt',
          role: 'system',
          content: this.SYSTEM_PROMPT,
          timestamp: new Date(),
        },
        ...messages.slice(1),
      ];
    }

    // No system message, prepend ours
    return [
      {
        id: 'system-prompt',
        role: 'system',
        content: this.SYSTEM_PROMPT,
        timestamp: new Date(),
      },
      ...messages,
    ];
  }

  /**
   * Generate cache key for request
   */
  private generateCacheKey(messages: AIMessage[], options: any): string {
    const messagesStr = JSON.stringify(messages.map(m => ({ role: m.role, content: m.content })));
    const optionsStr = JSON.stringify(options);
    return `ai-${this.model}-${messagesStr}-${optionsStr}`;
  }

  /**
   * Send a chat completion request with retry logic and caching
   */
  async sendMessage(
    messages: AIMessage[],
    options: {
      stream?: boolean;
      temperature?: number;
      maxTokens?: number;
      useCache?: boolean;
    } = {}
  ): Promise<ChatGPTResponse> {
    // Prepend system prompt to messages
    const messagesWithSystemPrompt = this.prependSystemPrompt(messages);

    // Check cache first (only for non-streaming requests)
    if (!options.stream && options.useCache !== false) {
      const cacheKey = this.generateCacheKey(messagesWithSystemPrompt, options);
      const cachedResponse = requestCache.get<ChatGPTResponse>(cacheKey);
      
      if (cachedResponse) {
        console.log('Using cached AI response');
        return cachedResponse;
      }
    }

    const isStreaming = options.stream || false;
    
    const request: ChatGPTRequest = {
      model: this.model,
      messages: messagesWithSystemPrompt.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content,
      })),
      stream: isStreaming,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000,
    };

    let lastError: AIError | null = null;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await this.makeRequest('/chat/completions', request);
        const data = await response.json();
        const result = data as ChatGPTResponse;
        
        // Cache successful response
        if (!options.stream && options.useCache !== false) {
          const cacheKey = this.generateCacheKey(messagesWithSystemPrompt, options);
          requestCache.set(cacheKey, result, this.CACHE_TTL);
        }
        
        return result;
      } catch (error) {
        lastError = error as AIError;
        
        // Log the error with context
        errorLoggingService.logNetworkError(
          error as Error,
          this.apiEndpoint,
          'POST',
          {
            component: 'AIService',
            action: 'sendMessage',
            additionalData: {
              attempt,
              maxRetries: this.maxRetries,
              model: this.model,
              messageCount: messages.length,
              errorCode: lastError.code,
              retryable: lastError.retryable,
            },
          }
        );
        
        // Don't retry if error is not retryable
        if (!lastError.retryable) {
          throw lastError;
        }

        // Wait before retrying with exponential backoff
        if (attempt < this.maxRetries - 1) {
          const delay = this.retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed - log final failure
    const finalError = lastError || this.createError('UNKNOWN_ERROR', 'Request failed after all retries', false);
    errorLoggingService.logError(
      finalError as Error,
      {
        component: 'AIService',
        action: 'sendMessage_final_failure',
        additionalData: {
          model: this.model,
          messageCount: messages.length,
        },
      },
      'critical'
    );
    throw finalError;
  }

  /**
   * Send a streaming chat completion request
   */
  async sendMessageStream(
    messages: AIMessage[],
    onChunk: (chunk: string) => void,
    options: {
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<void> {
    // Prepend system prompt to messages
    const messagesWithSystemPrompt = this.prependSystemPrompt(messages);

    const request: ChatGPTRequest = {
      model: this.model,
      messages: messagesWithSystemPrompt.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content,
      })),
      stream: true,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000,
    };

    const response = await this.makeRequest('/chat/completions', request, true);
    
    if (!response.body) {
      throw this.createError('STREAM_ERROR', 'Response body is null', false);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            // OpenAI uses [DONE] to signal end of stream
            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed: ChatGPTStreamChunk = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              console.error('Failed to parse OpenAI stream chunk:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Detect if a query requires web search
   */
  private detectWebSearchIntent(message: string): boolean {
    const searchKeywords = [
      'search', 'find', 'look up', 'what is', 'who is', 'when did', 'where is',
      'current', 'latest', 'recent', 'news', 'today', 'now', 'happening',
      'price of', 'weather', 'stock', 'score', 'result',
    ];

    const lowerMessage = message.toLowerCase();
    return searchKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Extract search query from user message
   */
  private extractSearchQuery(message: string): string {
    // Remove common question words and return the core query
    let query = message
      .replace(/^(what is|who is|when did|where is|how to|can you|please|search for|find|look up)/gi, '')
      .trim();
    
    // If query is too short, use the full message
    if (query.length < 3) {
      query = message;
    }

    return query;
  }

  /**
   * Format search results for AI context
   */
  private formatSearchResults(results: SearchResult[]): string {
    if (results.length === 0) {
      return 'No search results found.';
    }

    let formatted = 'Web Search Results:\n\n';
    results.forEach((result, index) => {
      formatted += `${index + 1}. ${result.title}\n`;
      formatted += `   Source: ${result.source}\n`;
      formatted += `   ${result.snippet}\n`;
      formatted += `   URL: ${result.url}\n\n`;
    });

    return formatted;
  }

  /**
   * Perform web search
   */
  async performWebSearch(query: string, maxResults?: number): Promise<SearchResult[]> {
    if (!this.webSearchService) {
      throw this.createError(
        'WEB_SEARCH_UNAVAILABLE',
        'Web search service is not configured',
        false
      );
    }

    return await this.webSearchService.search({
      query,
      maxResults: maxResults || 3,
    });
  }

  /**
   * Send a message with automatic web search integration
   */
  async sendMessageWithSearch(
    messages: AIMessage[],
    options: {
      stream?: boolean;
      temperature?: number;
      maxTokens?: number;
      useCache?: boolean;
      forceWebSearch?: boolean;
    } = {}
  ): Promise<{
    response: ChatGPTResponse;
    searchResults?: SearchResult[];
  }> {
    const lastMessage = messages[messages.length - 1];
    let searchResults: SearchResult[] | undefined;

    // Detect if web search is needed
    const needsSearch = options.forceWebSearch || 
      (this.webSearchService && this.detectWebSearchIntent(lastMessage.content));

    if (needsSearch && this.webSearchService) {
      try {
        // Perform web search
        const searchQuery = this.extractSearchQuery(lastMessage.content);
        searchResults = await this.performWebSearch(searchQuery, 3);

        // Add search results to context
        if (searchResults.length > 0) {
          const searchContext = this.formatSearchResults(searchResults);
          const enhancedMessages = [
            ...messages.slice(0, -1),
            {
              ...lastMessage,
              content: `${lastMessage.content}\n\n${searchContext}\n\nPlease use the above search results to provide an accurate and up-to-date answer. Include source citations in your response.`,
            },
          ];

          const response = await this.sendMessage(enhancedMessages, options);
          return { response, searchResults };
        }
      } catch (error) {
        console.warn('Web search failed, continuing without search results:', error);
      }
    }

    // Send message without search results
    const response = await this.sendMessage(messages, options);
    return { response, searchResults };
  }

  /**
   * Get the current rate limit status
   */
  getRateLimitStatus(): {
    requestsRemaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest > this.RATE_LIMIT_WINDOW) {
      return {
        requestsRemaining: this.MAX_REQUESTS_PER_WINDOW,
        resetTime: 0,
      };
    }

    return {
      requestsRemaining: Math.max(0, this.MAX_REQUESTS_PER_WINDOW - this.requestCount),
      resetTime: this.lastRequestTime + this.RATE_LIMIT_WINDOW,
    };
  }

  /**
   * Get web search service usage statistics
   */
  getWebSearchStats() {
    return this.webSearchService?.getUsageStats() || null;
  }

  /**
   * Detect if a query requires image generation (explicit request)
   */
  private detectImageGenerationIntent(message: string): boolean {
    const generationKeywords = [
      'generate', 'create', 'draw', 'make', 'design', 'imagine',
      'visualize', 'render', 'produce', 'paint', 'sketch', 'illustrate',
      'generate an image', 'generate a picture', 'generate image',
      'create an image', 'create a picture', 'create image',
      'draw me', 'draw an', 'draw a',
      'make me a picture', 'make me an image', 'make an image',
      'design an image', 'design a picture',
    ];

    const lowerMessage = message.toLowerCase();
    return generationKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Detect if a query would benefit from images (proactive image enhancement)
   * NOTE: This should NOT trigger if image generation is requested
   */
  private detectImageIntent(message: string, aiResponse?: string): boolean {
    // First check if this is an image generation request - if so, don't search
    if (this.detectImageGenerationIntent(message)) {
      return false;
    }

    const imageKeywords = [
      'show', 'photo', 'visual', 'look like', 'appearance',
      'diagram', 'illustration', 'example of', 'what does', 'how does',
    ];

    // Check user message
    const lowerMessage = message.toLowerCase();
    const hasImageKeyword = imageKeywords.some(keyword => lowerMessage.includes(keyword));

    // Check AI response for visual concepts (if available)
    if (aiResponse) {
      const visualConcepts = [
        'animal', 'plant', 'building', 'landscape', 'person', 'object',
        'place', 'location', 'city', 'country', 'monument', 'artwork',
        'scientific', 'historical', 'geographic', 'educational',
      ];
      const lowerResponse = aiResponse.toLowerCase();
      const hasVisualConcept = visualConcepts.some(concept => lowerResponse.includes(concept));
      
      return hasImageKeyword || hasVisualConcept;
    }

    return hasImageKeyword;
  }



  /**
   * Extract image queries from user query and AI response
   */
  private extractImageQueries(userQuery: string, aiResponse: string): string[] {
    const queries: string[] = [];

    // First, try to extract the main subject from the user query
    // Remove common question words and get the core subject
    let cleanedQuery = userQuery.toLowerCase();
    
    // Remove politeness words and filler (multiple passes to handle combinations like "can u pls")
    cleanedQuery = cleanedQuery.replace(/^(can you|could you|can u|could u|please|pls|plz)\s+/, '');
    cleanedQuery = cleanedQuery.replace(/^(can you|could you|can u|could u|please|pls|plz)\s+/, '');
    cleanedQuery = cleanedQuery.replace(/\s+(please|pls|plz)\s+/g, ' ');
    
    // Remove question patterns
    cleanedQuery = cleanedQuery.replace(/^(what is|what are|what's|who is|who are|who's|tell me about|show me|show|explain|describe|find|search for|look for|get|give me)\s+/, '');
    
    // Remove "images of", "pictures of", "photos of", "a image of", "an image of"
    cleanedQuery = cleanedQuery.replace(/^(an?\s+)?(images?|pictures?|photos?|pics?)\s+(of|about|for)\s+/, '');
    
    // Remove remaining articles at the start
    cleanedQuery = cleanedQuery.replace(/^(a|an|the)\s+/, '');
    
    // Remove trailing question marks and punctuation
    cleanedQuery = cleanedQuery.replace(/[?!.]+$/, '');
    
    cleanedQuery = cleanedQuery.trim();

    console.log('🔍 Extracting image query:', {
      original: userQuery,
      cleaned: cleanedQuery,
    });

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
   * Perform image search using Unsplash
   */
  async performImageSearch(query: string, maxResults?: number): Promise<UnsplashImage[]> {
    if (!this.imageSearchService) {
      throw this.createError(
        'IMAGE_SEARCH_UNAVAILABLE',
        'Image search service is not configured',
        false
      );
    }

    return await this.imageSearchService.searchImages({
      query,
      maxResults: maxResults || 3,
    });
  }

  /**
   * Send a message with automatic image search integration (proactive enhancement)
   */
  async sendMessageWithImages(
    messages: AIMessage[],
    options: {
      stream?: boolean;
      temperature?: number;
      maxTokens?: number;
      useCache?: boolean;
      forceImageSearch?: boolean;
      enableProactiveImages?: boolean;
    } = {}
  ): Promise<{
    response: ChatGPTResponse;
    images?: UnsplashImage[];
  }> {
    const lastMessage = messages[messages.length - 1];
    let images: UnsplashImage[] | undefined;

    // First, get the AI response
    const response = await this.sendMessage(messages, options);
    const aiResponseText = response.choices[0]?.message?.content || '';

    // Detect if images would enhance understanding
    const needsImages = options.forceImageSearch || 
      (options.enableProactiveImages !== false && 
       this.imageSearchService && 
       this.detectImageIntent(lastMessage.content, aiResponseText));

    if (needsImages && this.imageSearchService) {
      try {
        // Extract image queries from both user message and AI response
        const imageQueries = this.extractImageQueries(lastMessage.content, aiResponseText);

        if (imageQueries.length > 0) {
          // Search for the first query (most relevant)
          images = await this.performImageSearch(imageQueries[0], 3);
          
          // If images were found, append a note to the AI response to make it aware
          if (images && images.length > 0) {
            const imageNote = `\n\n*[${images.length} relevant image${images.length > 1 ? 's' : ''} displayed below]*`;
            response.choices[0].message.content += imageNote;
          }
        }
      } catch (error) {
        console.warn('Image search failed, continuing without images:', error);
      }
    }

    return { response, images };
  }

  /**
   * Send a message with both web search and image search integration
   */
  async sendMultimodalMessage(
    messages: AIMessage[],
    options: {
      stream?: boolean;
      temperature?: number;
      maxTokens?: number;
      useCache?: boolean;
      forceWebSearch?: boolean;
      forceImageSearch?: boolean;
      enableProactiveImages?: boolean;
    } = {}
  ): Promise<{
    response: ChatGPTResponse;
    searchResults?: SearchResult[];
    images?: UnsplashImage[];
  }> {
    const lastMessage = messages[messages.length - 1];
    let searchResults: SearchResult[] | undefined;
    let images: UnsplashImage[] | undefined;

    // Detect if web search is needed
    const needsSearch = options.forceWebSearch || 
      (this.webSearchService && this.detectWebSearchIntent(lastMessage.content));

    // Perform web search if needed
    if (needsSearch && this.webSearchService) {
      try {
        const searchQuery = this.extractSearchQuery(lastMessage.content);
        searchResults = await this.performWebSearch(searchQuery, 3);

        // Add search results to context
        if (searchResults.length > 0) {
          const searchContext = this.formatSearchResults(searchResults);
          messages = [
            ...messages.slice(0, -1),
            {
              ...lastMessage,
              content: `${lastMessage.content}\n\n${searchContext}\n\nPlease use the above search results to provide an accurate and up-to-date answer. Include source citations in your response.`,
            },
          ];
        }
      } catch (error) {
        console.warn('Web search failed, continuing without search results:', error);
      }
    }

    // Get AI response
    const response = await this.sendMessage(messages, options);
    const aiResponseText = response.choices[0]?.message?.content || '';

    // Detect if images would enhance understanding
    const needsImages = options.forceImageSearch || 
      (options.enableProactiveImages !== false && 
       this.imageSearchService && 
       this.detectImageIntent(lastMessage.content, aiResponseText));

    if (needsImages && this.imageSearchService) {
      try {
        const imageQueries = this.extractImageQueries(lastMessage.content, aiResponseText);

        if (imageQueries.length > 0) {
          images = await this.performImageSearch(imageQueries[0], 3);
        }
      } catch (error) {
        console.warn('Image search failed, continuing without images:', error);
      }
    }

    return { response, searchResults, images };
  }

  /**
   * Get image search service usage statistics
   */
  getImageSearchStats() {
    return this.imageSearchService?.getUsageStats() || null;
  }

  /**
   * Generate an image using DALL-E
   */
  async generateImage(prompt: string, options?: {
    size?: '256x256' | '512x512' | '1024x1024';
    quality?: 'standard' | 'hd';
  }): Promise<GeneratedImage> {
    if (!this.imageGenService) {
      throw this.createError(
        'IMAGE_GENERATION_UNAVAILABLE',
        'Image generation service is not configured',
        false
      );
    }

    return await this.imageGenService.generateImage({
      prompt,
      size: options?.size || '512x512',
      quality: options?.quality || 'standard',
    });
  }

  /**
   * Send a message with image generation support
   */
  async sendMessageWithGeneration(
    messages: AIMessage[],
    options: {
      stream?: boolean;
      temperature?: number;
      maxTokens?: number;
      useCache?: boolean;
      forceImageGeneration?: boolean;
    } = {}
  ): Promise<{
    response: ChatGPTResponse;
    generatedImages?: GeneratedImage[];
  }> {
    const lastMessage = messages[messages.length - 1];
    let generatedImages: GeneratedImage[] | undefined;

    // Detect if image generation is needed
    const needsGeneration = options.forceImageGeneration || 
      (this.imageGenService && this.detectImageGenerationIntent(lastMessage.content));

    // Get AI response first
    const response = await this.sendMessage(messages, options);

    if (needsGeneration && this.imageGenService) {
      try {
        // Extract image prompt from user message
        const imagePrompt = this.extractSearchQuery(lastMessage.content);

        if (imagePrompt.length > 3) {
          const generatedImage = await this.generateImage(imagePrompt);
          generatedImages = [generatedImage];
        }
      } catch (error) {
        console.warn('Image generation failed:', error);
        
        // If timeout, add note to response
        if ((error as AIError).code === 'GENERATION_TIMEOUT') {
          response.choices[0].message.content += '\n\n*[Image generation timed out after 10 seconds. Please try again.]*';
        }
      }
    }

    return { response, generatedImages };
  }

  /**
   * Send a message with full multimodal support (web search, image search, and image generation)
   */
  async sendFullMultimodalMessage(
    messages: AIMessage[],
    options: {
      stream?: boolean;
      temperature?: number;
      maxTokens?: number;
      useCache?: boolean;
      forceWebSearch?: boolean;
      forceImageSearch?: boolean;
      forceImageGeneration?: boolean;
      enableProactiveImages?: boolean;
      preferUnsplash?: boolean;
    } = {}
  ): Promise<{
    response: ChatGPTResponse;
    searchResults?: SearchResult[];
    images?: UnsplashImage[];
    generatedImages?: GeneratedImage[];
  }> {
    const lastMessage = messages[messages.length - 1];
    let searchResults: SearchResult[] | undefined;
    let images: UnsplashImage[] | undefined;
    let generatedImages: GeneratedImage[] | undefined;

    // Detect intents
    const needsSearch = options.forceWebSearch || 
      (this.webSearchService && this.detectWebSearchIntent(lastMessage.content));
    const needsImageGeneration = options.forceImageGeneration || 
      (this.imageGenService && this.detectImageGenerationIntent(lastMessage.content));
    
    console.log('🎨 Multimodal intent detection:', {
      message: lastMessage.content.substring(0, 60),
      needsWebSearch: needsSearch,
      needsImageGeneration,
      hasImageGenService: !!this.imageGenService,
      hasImageSearchService: !!this.imageSearchService,
    });

    // Perform web search if needed
    if (needsSearch && this.webSearchService) {
      try {
        const searchQuery = this.extractSearchQuery(lastMessage.content);
        searchResults = await this.performWebSearch(searchQuery, 3);

        // Add search results to context
        if (searchResults.length > 0) {
          const searchContext = this.formatSearchResults(searchResults);
          messages = [
            ...messages.slice(0, -1),
            {
              ...lastMessage,
              content: `${lastMessage.content}\n\n${searchContext}\n\nPlease use the above search results to provide an accurate and up-to-date answer. Include source citations in your response.`,
            },
          ];
        }
      } catch (error) {
        console.warn('Web search failed, continuing without search results:', error);
      }
    }

    // Get AI response
    const response = await this.sendMessage(messages, options);
    const aiResponseText = response.choices[0]?.message?.content || '';

    // Handle image generation (explicit request)
    if (needsImageGeneration && this.imageGenService) {
      try {
        const imagePrompt = this.extractSearchQuery(lastMessage.content);
        console.log('🎨 Generating image with prompt:', imagePrompt);
        if (imagePrompt.length > 3) {
          const generatedImage = await this.generateImage(imagePrompt);
          console.log('✅ Image generated successfully:', generatedImage.url);
          generatedImages = [generatedImage];
        } else {
          console.warn('⚠️ Image prompt too short:', imagePrompt);
        }
      } catch (error) {
        console.error('❌ Image generation failed:', error);
        
        // If timeout, add note to response
        if ((error as AIError).code === 'GENERATION_TIMEOUT') {
          response.choices[0].message.content += '\n\n*[Image generation timed out after 10 seconds. Please try again.]*';
        }
      }
    } else if (needsImageGeneration && !this.imageGenService) {
      console.warn('⚠️ Image generation requested but service not available');
    }
    // Handle proactive image enhancement (prefer Unsplash over DALL-E)
    else {
      const needsImages = options.forceImageSearch || 
        (options.enableProactiveImages !== false && 
         this.imageSearchService && 
         this.detectImageIntent(lastMessage.content, aiResponseText));

      if (needsImages) {
        // Try Unsplash first (free)
        if (this.imageSearchService && (options.preferUnsplash !== false)) {
          try {
            const imageQueries = this.extractImageQueries(lastMessage.content, aiResponseText);
            if (imageQueries.length > 0) {
              images = await this.performImageSearch(imageQueries[0], 3);
            }
          } catch (error) {
            console.warn('Image search failed:', error);
          }
        }

        // Fallback to DALL-E if Unsplash didn't return results
        if ((!images || images.length === 0) && this.imageGenService) {
          try {
            const imageQueries = this.extractImageQueries(lastMessage.content, aiResponseText);
            if (imageQueries.length > 0) {
              const generatedImage = await this.generateImage(imageQueries[0]);
              generatedImages = [generatedImage];
            }
          } catch (error) {
            console.warn('Image generation fallback failed:', error);
          }
        }
      }
    }

    return { response, searchResults, images, generatedImages };
  }

  /**
   * Get image generation service usage statistics
   */
  getImageGenStats() {
    return this.imageGenService?.getUsageStats() || null;
  }
}

export default AIService;
