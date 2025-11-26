import requestCache from '../utils/requestCache';
import type {
  AIServiceConfig,
  DoubaoRequest,
  DoubaoResponse,
  DoubaoStreamChunk,
  AIMessage,
  AIError,
} from '../types/ai.types';

/**
 * AIService handles communication with the Doubao API
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

  constructor(config: AIServiceConfig) {
    this.apiKey = config.apiKey;
    this.apiEndpoint = config.apiEndpoint;
    this.model = config.model || 'doubao-pro-32k';
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelay || 1000;
  }

  /**
   * Initialize the AI service with environment variables
   */
  static initialize(): AIService {
    const apiKey = import.meta.env.VITE_DOUBAO_API_KEY;
    const apiEndpoint = import.meta.env.VITE_DOUBAO_API_ENDPOINT;

    if (!apiKey || !apiEndpoint) {
      throw new Error('Doubao API configuration is missing. Please check environment variables.');
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
   * Make an authenticated request to the Doubao API
   */
  private async makeRequest(
    endpoint: string,
    body: DoubaoRequest,
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
      
      // Determine if error is retryable
      const retryable = response.status >= 500 || response.status === 429;
      
      throw this.createError(
        errorData.error?.code || 'API_ERROR',
        errorMessage,
        retryable
      );
    }

    return response;
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
  ): Promise<DoubaoResponse> {
    // Check cache first (only for non-streaming requests)
    if (!options.stream && options.useCache !== false) {
      const cacheKey = this.generateCacheKey(messages, options);
      const cachedResponse = requestCache.get<DoubaoResponse>(cacheKey);
      
      if (cachedResponse) {
        console.log('Using cached AI response');
        return cachedResponse;
      }
    }

    const isStreaming = options.stream || false;
    
    const request: DoubaoRequest = {
      model: this.model,
      messages: messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
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
        const result = data as DoubaoResponse;
        
        // Cache successful response
        if (!options.stream && options.useCache !== false) {
          const cacheKey = this.generateCacheKey(messages, options);
          requestCache.set(cacheKey, result, this.CACHE_TTL);
        }
        
        return result;
      } catch (error) {
        lastError = error as AIError;
        
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

    // All retries failed
    throw lastError || this.createError('UNKNOWN_ERROR', 'Request failed after all retries', false);
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
    const request: DoubaoRequest = {
      model: this.model,
      messages: messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
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
            
            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed: DoubaoStreamChunk = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              console.error('Failed to parse stream chunk:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
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
}

export default AIService;
