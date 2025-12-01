import type {
  ImageGenConfig,
  ImageRequest,
  GeneratedImage,
  ImageGenUsageStats,
  AIError,
} from '../types/ai.types';

/**
 * ImageGenerationService provides image generation capabilities using DALL-E API
 * Implements image compression, timeout handling, and cost tracking
 * Used as fallback when Unsplash doesn't have suitable images
 */
class ImageGenerationService {
  private apiKey: string;
  private model: 'dall-e-2' | 'dall-e-3';
  private defaultSize: string;
  private compressionEnabled: boolean;
  private compressionQuality: number;
  private timeout: number;
  private usageStats: ImageGenUsageStats;
  private cache: Map<string, GeneratedImage>;
  private readonly DALLE_ENDPOINT = 'https://api.openai.com/v1/images/generations';
  private readonly COST_PER_IMAGE_DALLE2 = 0.02; // $0.02 per image for 512x512
  private readonly COST_PER_IMAGE_DALLE3 = 0.04; // $0.04 per image for 1024x1024 standard

  constructor(config: ImageGenConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'dall-e-2';
    this.defaultSize = config.defaultSize || '512x512';
    this.compressionEnabled = config.compressionEnabled !== false;
    this.compressionQuality = config.compressionQuality || 0.8;
    this.timeout = config.timeout || 10000; // 10 seconds default
    this.cache = new Map();
    this.usageStats = {
      totalGenerations: 0,
      estimatedCost: 0,
      averageGenerationTime: 0,
      timeouts: 0,
    };
  }

  /**
   * Initialize the image generation service with environment variables
   */
  static initialize(): ImageGenerationService {
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (!openaiKey) {
      throw new Error('OpenAI API configuration is missing. Please set VITE_OPENAI_API_KEY.');
    }

    const service = new ImageGenerationService({
      apiKey: openaiKey,
      model: 'dall-e-2',
      defaultSize: '512x512',
      compressionEnabled: true,
      compressionQuality: 0.8,
      timeout: 30000, // Increased to 30 seconds for DALL-E API
    });
    
    console.log('✅ ImageGenerationService initialized with 30s timeout');
    return service;
  }

  /**
   * Generate cache key for an image request
   */
  private generateCacheKey(request: ImageRequest): string {
    return `dalle-${this.model}-${request.prompt}-${request.size || this.defaultSize}-${request.quality || 'standard'}`;
  }

  /**
   * Create a standardized error object
   */
  private createError(code: string, message: string, retryable: boolean): AIError {
    return { code, message, retryable };
  }

  /**
   * Compress an image using canvas
   */
  async compressImage(imageUrl: string, quality?: number): Promise<string> {
    if (!this.compressionEnabled) {
      return imageUrl;
    }

    const compressionQuality = quality || this.compressionQuality;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(imageUrl); // Fallback to original if canvas not supported
            return;
          }

          ctx.drawImage(img, 0, 0);

          // Convert to compressed JPEG
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedUrl = URL.createObjectURL(blob);
                resolve(compressedUrl);
              } else {
                resolve(imageUrl); // Fallback to original
              }
            },
            'image/jpeg',
            compressionQuality
          );
        } catch (error) {
          console.warn('Image compression failed:', error);
          resolve(imageUrl); // Fallback to original
        }
      };

      img.onerror = () => {
        console.warn('Failed to load image for compression');
        resolve(imageUrl); // Fallback to original
      };

      img.src = imageUrl;
    });
  }

  /**
   * Calculate estimated cost for an image generation request
   */
  private calculateCost(request: ImageRequest): number {
    if (this.model === 'dall-e-3') {
      return request.quality === 'hd' ? 0.08 : this.COST_PER_IMAGE_DALLE3;
    }
    return this.COST_PER_IMAGE_DALLE2;
  }

  /**
   * Generate an image using DALL-E API with timeout handling
   */
  async generateImage(request: ImageRequest): Promise<GeneratedImage> {
    // Check cache first
    const cacheKey = this.generateCacheKey(request);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log('Using cached generated image');
      return cached;
    }

    const startTime = Date.now();
    this.usageStats.totalGenerations++;

    // Build request body
    const requestBody: any = {
      model: this.model,
      prompt: request.prompt,
      n: request.n || 1,
      size: request.size || this.defaultSize,
    };

    // DALL-E 3 specific options
    if (this.model === 'dall-e-3') {
      requestBody.quality = request.quality || 'standard';
    }

    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          this.usageStats.timeouts++;
          reject(
            this.createError(
              'GENERATION_TIMEOUT',
              `Image generation timed out after ${this.timeout / 1000} seconds`,
              true
            )
          );
        }, this.timeout);
      });

      // Create fetch promise
      console.log('🎨 Calling DALL-E API with request:', {
        endpoint: this.DALLE_ENDPOINT,
        model: this.model,
        prompt: request.prompt.substring(0, 50),
        size: request.size || this.defaultSize,
      });
      
      const fetchPromise = fetch(this.DALLE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      // Race between timeout and fetch
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      console.log('✅ DALL-E API responded with status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.createError(
          'DALLE_API_ERROR',
          errorData.error?.message || `DALL-E API error: ${response.status}`,
          response.status >= 500
        );
      }

      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        throw this.createError(
          'NO_IMAGE_GENERATED',
          'DALL-E did not return any images',
          false
        );
      }

      const imageData = data.data[0];
      const generationTime = Date.now() - startTime;

      // Update average generation time
      const totalTime = this.usageStats.averageGenerationTime * (this.usageStats.totalGenerations - 1);
      this.usageStats.averageGenerationTime = (totalTime + generationTime) / this.usageStats.totalGenerations;

      // Update cost
      this.usageStats.estimatedCost += this.calculateCost(request);

      // Compress image if enabled
      let compressedUrl: string | undefined;
      if (this.compressionEnabled) {
        try {
          compressedUrl = await this.compressImage(imageData.url);
        } catch (error) {
          console.warn('Image compression failed:', error);
        }
      }

      const result: GeneratedImage = {
        url: imageData.url,
        compressedUrl,
        revisedPrompt: imageData.revised_prompt,
        size: request.size || this.defaultSize,
        generatedAt: new Date(),
        source: 'dalle',
      };

      // Cache the result
      this.cache.set(cacheKey, result);

      return result;
    } catch (error) {
      if ((error as AIError).code) {
        throw error;
      }
      throw this.createError(
        'NETWORK_ERROR',
        `Failed to generate image: ${(error as Error).message}`,
        true
      );
    }
  }

  /**
   * Clear all cached generated images
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): ImageGenUsageStats {
    return { ...this.usageStats };
  }

  /**
   * Reset usage statistics
   */
  resetUsageStats(): void {
    this.usageStats = {
      totalGenerations: 0,
      estimatedCost: 0,
      averageGenerationTime: 0,
      timeouts: 0,
    };
  }
}

export default ImageGenerationService;
