/**
 * Property-Based Tests for Image Generation Service
 * Tests DALL-E integration, compression, timeout handling, and cost tracking
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import ImageGenerationService from '../services/ImageGenerationService';
import type { ImageRequest, GeneratedImage } from '../types/ai.types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock Image and Canvas for compression tests
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  crossOrigin: string = '';
  src: string = '';
  width: number = 512;
  height: number = 512;

  constructor() {
    // Simulate async image loading
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 10);
  }
}

class MockCanvas {
  width: number = 0;
  height: number = 0;

  getContext() {
    return {
      drawImage: vi.fn(),
    };
  }

  toBlob(callback: (blob: Blob | null) => void, type: string, quality: number) {
    // Simulate blob creation
    const blob = new Blob(['mock-image-data'], { type });
    callback(blob);
  }
}

global.Image = MockImage as any;
global.document = {
  createElement: (tag: string) => {
    if (tag === 'canvas') {
      return new MockCanvas() as any;
    }
    return {} as any;
  },
} as any;

// Custom arbitraries for image generation
const imagePromptArbitrary = fc.string({ minLength: 3, maxLength: 200 });
const imageSizeArbitrary = fc.constantFrom('256x256', '512x512', '1024x1024');
const imageQualityArbitrary = fc.constantFrom('standard', 'hd');
const dalleModelArbitrary = fc.constantFrom('dall-e-2', 'dall-e-3');

describe('ImageGenerationService Property Tests', () => {
  let service: ImageGenerationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ImageGenerationService({
      apiKey: 'test-api-key',
      model: 'dall-e-2',
      defaultSize: '512x512',
      compressionEnabled: true,
      compressionQuality: 0.8,
      timeout: 10000,
    });
  });

  afterEach(() => {
    service.clearCache();
    service.resetUsageStats();
  });

  /**
   * **Feature: classroom-ui-overhaul, Property 18: Image generation and display**
   * For any user request for an image, an image should be generated using DALL-E 
   * and displayed in the AI output panel
   * **Validates: Requirements 4.2**
   */
  it('Property 18: should generate and return an image for any valid prompt', async () => {
    await fc.assert(
      fc.asyncProperty(
        imagePromptArbitrary,
        imageSizeArbitrary,
        async (prompt, size) => {
          // Mock successful DALL-E API response
          mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              data: [
                {
                  url: `https://example.com/generated-image-${Date.now()}.png`,
                  revised_prompt: `Enhanced: ${prompt}`,
                },
              ],
            }),
          });

          const request: ImageRequest = {
            prompt,
            size: size as any,
          };

          const result = await service.generateImage(request);

          // Verify image was generated
          expect(result).toBeDefined();
          expect(result.url).toBeTruthy();
          expect(result.source).toBe('dalle');
          expect(result.size).toBe(size);
          expect(result.generatedAt).toBeInstanceOf(Date);

          // Verify API was called correctly
          expect(mockFetch).toHaveBeenCalled();
          const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
          expect(lastCall[0]).toBe('https://api.openai.com/v1/images/generations');
          expect(lastCall[1].method).toBe('POST');
          expect(lastCall[1].headers['Authorization']).toBe('Bearer test-api-key');
          
          // Verify the request body contains the prompt
          const requestBody = JSON.parse(lastCall[1].body);
          expect(requestBody.prompt).toBe(prompt);
          expect(requestBody.model).toBe('dall-e-2');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: classroom-ui-overhaul, Property 23: Image generation timeout**
   * For any image generation request, if the generation takes longer than 10 seconds,
   * a timeout message should be displayed
   * **Validates: Requirements 4.7**
   */
  it('Property 23: should timeout after configured duration for any request', async () => {
    await fc.assert(
      fc.asyncProperty(
        imagePromptArbitrary,
        async (prompt) => {
          // Create service with short timeout for testing
          const shortTimeoutService = new ImageGenerationService({
            apiKey: 'test-api-key',
            model: 'dall-e-2',
            timeout: 100, // 100ms timeout
          });

          // Mock slow API response (longer than timeout)
          // Don't resolve at all - let it timeout
          mockFetch.mockImplementationOnce(
            () =>
              new Promise(() => {
                // Never resolves - will timeout
              })
          );

          const request: ImageRequest = {
            prompt,
            size: '512x512',
          };

          // Expect timeout error
          await expect(shortTimeoutService.generateImage(request)).rejects.toMatchObject({
            code: 'GENERATION_TIMEOUT',
            message: expect.stringContaining('timed out'),
            retryable: true,
          });

          // Verify timeout was tracked in stats
          const stats = shortTimeoutService.getUsageStats();
          expect(stats.timeouts).toBeGreaterThan(0);
        }
      ),
      { numRuns: 10 } // Fewer runs due to timeout delays (10 runs * 100ms = 1 second)
    );
  }, 15000); // 15 second timeout for the test itself

  /**
   * **Feature: classroom-ui-overhaul, Property 25: Cost-effective image model**
   * For any image generation request, the system should use DALL-E 2 by default
   * unless higher quality is explicitly requested
   * **Validates: Requirements 5.3**
   */
  it('Property 25: should use DALL-E 2 by default for cost-effectiveness', async () => {
    await fc.assert(
      fc.asyncProperty(
        imagePromptArbitrary,
        imageSizeArbitrary,
        async (prompt, size) => {
          // Mock successful API response
          mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              data: [
                {
                  url: 'https://example.com/image.png',
                },
              ],
            }),
          });

          const request: ImageRequest = {
            prompt,
            size: size as any,
            // No quality specified - should default to DALL-E 2
          };

          // Reset stats and clear cache before this test
          service.resetUsageStats();
          service.clearCache();
          
          await service.generateImage(request);

          // Verify DALL-E 2 was used (check request body)
          const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
          const requestBody = JSON.parse(lastCall[1].body);
          expect(requestBody.model).toBe('dall-e-2');

          // Verify cost is tracked at DALL-E 2 rate ($0.02)
          const stats = service.getUsageStats();
          expect(stats.estimatedCost).toBeCloseTo(0.02, 2);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: classroom-ui-overhaul, Property 27: Image compression**
   * For any generated image, the image should be compressed to reduce bandwidth
   * without significant quality loss
   * **Validates: Requirements 5.7**
   */
  it('Property 27: should compress generated images when compression is enabled', async () => {
    await fc.assert(
      fc.asyncProperty(
        imagePromptArbitrary,
        fc.integer({ min: 50, max: 100 }),
        async (prompt, quality) => {
          // Create service with specific compression quality
          const compressionService = new ImageGenerationService({
            apiKey: 'test-api-key',
            model: 'dall-e-2',
            compressionEnabled: true,
            compressionQuality: quality / 100,
          });

          // Mock successful API response
          mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              data: [
                {
                  url: 'https://example.com/original-image.png',
                },
              ],
            }),
          });

          const request: ImageRequest = {
            prompt,
            size: '512x512',
          };

          const result = await compressionService.generateImage(request);

          // Verify both original and compressed URLs are present
          expect(result.url).toBeTruthy();
          expect(result.compressedUrl).toBeTruthy();

          // Compressed URL should be different from original (blob URL)
          if (result.compressedUrl) {
            expect(result.compressedUrl).not.toBe(result.url);
            // Blob URLs start with 'blob:'
            expect(result.compressedUrl.startsWith('blob:')).toBe(true);
          }
        }
      ),
      { numRuns: 50 } // Fewer runs due to async image processing
    );
  });

  /**
   * Additional property: Image caching
   * For any repeated request with the same parameters, the cached result should be returned
   */
  it('should cache and reuse generated images for identical requests', async () => {
    await fc.assert(
      fc.asyncProperty(
        imagePromptArbitrary,
        imageSizeArbitrary,
        async (prompt, size) => {
          // Mock successful API response
          mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({
              data: [
                {
                  url: `https://example.com/image-${Date.now()}.png`,
                },
              ],
            }),
          });

          const request: ImageRequest = {
            prompt,
            size: size as any,
          };

          // First request - should call API
          const result1 = await service.generateImage(request);
          const apiCallCount1 = mockFetch.mock.calls.length;

          // Second identical request - should use cache
          const result2 = await service.generateImage(request);
          const apiCallCount2 = mockFetch.mock.calls.length;

          // Verify cache was used (no additional API call)
          expect(apiCallCount2).toBe(apiCallCount1);

          // Verify results are identical
          expect(result2.url).toBe(result1.url);
          expect(result2.generatedAt).toEqual(result1.generatedAt);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Cost tracking accuracy
   * For any number of image generations, the total cost should be accurately tracked
   */
  it('should accurately track costs for all generations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(imagePromptArbitrary, { minLength: 1, maxLength: 10 }),
        async (prompts) => {
          // Reset stats and clear cache to ensure fresh generations
          service.resetUsageStats();
          service.clearCache();

          // Mock successful API responses
          mockFetch.mockImplementation(async () => ({
            ok: true,
            json: async () => ({
              data: [
                {
                  url: `https://example.com/image-${Date.now()}-${Math.random()}.png`,
                },
              ],
            }),
          }));

          // Generate images for all prompts
          for (const prompt of prompts) {
            await service.generateImage({
              prompt,
              size: '512x512',
            });
          }

          const stats = service.getUsageStats();

          // Verify generation count
          expect(stats.totalGenerations).toBe(prompts.length);

          // Verify cost (DALL-E 2 at $0.02 per image)
          const expectedCost = prompts.length * 0.02;
          expect(stats.estimatedCost).toBeCloseTo(expectedCost, 2);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Additional property: Error handling
   * For any API error, the service should throw a properly formatted error
   */
  it('should handle API errors gracefully for any request', async () => {
    await fc.assert(
      fc.asyncProperty(
        imagePromptArbitrary,
        fc.integer({ min: 400, max: 599 }),
        async (prompt, statusCode) => {
          // Mock API error
          mockFetch.mockResolvedValueOnce({
            ok: false,
            status: statusCode,
            json: async () => ({
              error: {
                message: `API error: ${statusCode}`,
              },
            }),
          });

          const request: ImageRequest = {
            prompt,
            size: '512x512',
          };

          // Expect error to be thrown
          await expect(service.generateImage(request)).rejects.toMatchObject({
            code: 'DALLE_API_ERROR',
            message: expect.stringContaining('API error'),
            retryable: statusCode >= 500, // Server errors are retryable
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Average generation time tracking
   * For any sequence of generations, the average time should be calculated correctly
   */
  it('should track average generation time accurately', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(imagePromptArbitrary, { minLength: 2, maxLength: 5 }),
        async (prompts) => {
          // Reset stats and clear cache
          service.resetUsageStats();
          service.clearCache();

          const generationTimes: number[] = [];

          for (const prompt of prompts) {
            // Mock API with minimal delay to avoid timeout
            const delay = Math.random() * 10; // Reduced from 100ms to 10ms
            mockFetch.mockImplementationOnce(
              () =>
                new Promise((resolve) => {
                  setTimeout(() => {
                    resolve({
                      ok: true,
                      json: async () => ({
                        data: [
                          {
                            url: `https://example.com/image-${Date.now()}-${Math.random()}.png`,
                          },
                        ],
                      }),
                    });
                  }, delay);
                })
            );

            const startTime = Date.now();
            await service.generateImage({
              prompt,
              size: '512x512',
            });
            const endTime = Date.now();
            generationTimes.push(endTime - startTime);
          }

          const stats = service.getUsageStats();

          // Calculate expected average
          const expectedAverage =
            generationTimes.reduce((sum, time) => sum + time, 0) / generationTimes.length;

          // Verify average is within reasonable range (±50ms tolerance for timing variations)
          expect(Math.abs(stats.averageGenerationTime - expectedAverage)).toBeLessThan(50);
        }
      ),
      { numRuns: 20 } // Fewer runs due to async delays
    );
  });
});
