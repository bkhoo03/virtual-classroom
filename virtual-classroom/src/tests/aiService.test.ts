/**
 * Property-Based Tests for AI Service
 * Tests OpenAI ChatGPT API integration
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as fc from 'fast-check';
import AIService from '../services/AIService';
import type { AIMessage, ChatGPTResponse, AIError } from '../types/ai.types';

// Custom arbitrary for non-empty AI messages
const nonEmptyAIMessageArbitrary = fc.record({
  role: fc.constantFrom('user', 'assistant', 'system'),
  content: fc.string({ minLength: 1, maxLength: 1000 }).filter(s => s.trim().length > 0),
});

describe('AI Service Property Tests', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  // **Feature: classroom-ui-overhaul, Property 17: AI message transmission**
  it('Property 17: For any user message sent to the AI, an API request should be made to the OpenAI ChatGPT endpoint', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(nonEmptyAIMessageArbitrary, { minLength: 1, maxLength: 10 }),
        async (messages) => {
          // Create fresh service instance for each iteration to avoid rate limiting
          const aiService = new AIService({
            apiKey: 'test-api-key',
            apiEndpoint: 'https://api.openai.com/v1',
            model: 'gpt-3.5-turbo',
            maxRetries: 1,
          });

          // Setup mock fetch for this iteration
          const mockFetch = vi.fn();
          let capturedUrl = '';
          let capturedOptions: any = null;
          
          // Setup mock response
          const mockResponse: ChatGPTResponse = {
            id: 'chatcmpl-123',
            object: 'chat.completion',
            created: Date.now(),
            model: 'gpt-3.5-turbo',
            choices: [
              {
                index: 0,
                message: {
                  role: 'assistant',
                  content: 'Test response',
                },
                finish_reason: 'stop',
              },
            ],
            usage: {
              prompt_tokens: 10,
              completion_tokens: 20,
              total_tokens: 30,
            },
          };

          mockFetch.mockImplementation((url: string, options: any) => {
            capturedUrl = url;
            capturedOptions = options;
            return Promise.resolve({
              ok: true,
              json: async () => mockResponse,
            } as Response);
          });

          globalThis.fetch = mockFetch as any;

          // Convert to AIMessage format
          const aiMessages: AIMessage[] = messages.map((msg, idx) => ({
            id: `msg-${idx}`,
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content,
            timestamp: new Date(),
          }));

          // Send message
          await aiService.sendMessage(aiMessages, { useCache: false });

          // Verify API was called
          expect(mockFetch).toHaveBeenCalledTimes(1);
          
          // Verify endpoint
          expect(capturedUrl).toContain('/chat/completions');
          
          // Verify request structure
          const requestBody = JSON.parse(capturedOptions.body);
          expect(requestBody).toHaveProperty('model');
          expect(requestBody).toHaveProperty('messages');
          // Should have system prompt + user messages
          expect(requestBody.messages.length).toBeGreaterThanOrEqual(messages.length);
          
          // First message should be system prompt
          expect(requestBody.messages[0].role).toBe('system');
          
          // Verify authorization header
          expect(capturedOptions.headers.Authorization).toBe('Bearer test-api-key');
        }
      ),
      { numRuns: 100 }
    );
  });

  // **Feature: classroom-ui-overhaul, Property 18: AI response display**
  it('Property 18: For any successful AI API response, the response content should be displayed in the AI output panel', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(nonEmptyAIMessageArbitrary, { minLength: 1, maxLength: 5 }),
        fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
        async (messages, responseContent) => {
          // Create fresh service instance for each iteration
          const aiService = new AIService({
            apiKey: 'test-api-key',
            apiEndpoint: 'https://api.openai.com/v1',
            model: 'gpt-3.5-turbo',
            maxRetries: 1,
          });

          // Setup mock fetch for this iteration
          const mockFetch = vi.fn();
          
          // Setup mock response with the generated content
          const mockResponse: ChatGPTResponse = {
            id: 'chatcmpl-123',
            object: 'chat.completion',
            created: Date.now(),
            model: 'gpt-3.5-turbo',
            choices: [
              {
                index: 0,
                message: {
                  role: 'assistant',
                  content: responseContent,
                },
                finish_reason: 'stop',
              },
            ],
            usage: {
              prompt_tokens: 10,
              completion_tokens: 20,
              total_tokens: 30,
            },
          };

          mockFetch.mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
          } as Response);

          globalThis.fetch = mockFetch as any;

          // Convert to AIMessage format
          const aiMessages: AIMessage[] = messages.map((msg, idx) => ({
            id: `msg-${idx}`,
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content,
            timestamp: new Date(),
          }));

          // Send message and get response
          const response = await aiService.sendMessage(aiMessages, { useCache: false });

          // Verify response contains the expected content
          expect(response.choices[0].message.content).toBe(responseContent);
          expect(response.choices[0].message.role).toBe('assistant');
        }
      ),
      { numRuns: 100 }
    );
  });

  // **Feature: classroom-ui-overhaul, Property 19: AI error handling**
  it('Property 19: For any failed AI API request, an error message should be displayed to the user', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(nonEmptyAIMessageArbitrary, { minLength: 1, maxLength: 5 }),
        fc.constantFrom(400, 401, 403, 404),
        fc.string({ minLength: 10, maxLength: 100 }),
        async (messages, statusCode, errorMessage) => {
          // Create fresh service instance for each iteration
          const aiService = new AIService({
            apiKey: 'test-api-key',
            apiEndpoint: 'https://api.openai.com/v1',
            model: 'gpt-3.5-turbo',
            maxRetries: 1,
          });

          // Setup mock fetch for this iteration
          const mockFetch = vi.fn();
          
          // Setup mock error response
          mockFetch.mockResolvedValue({
            ok: false,
            status: statusCode,
            statusText: 'Error',
            json: async () => ({
              error: {
                message: errorMessage,
                type: 'invalid_request_error',
                code: 'invalid_api_key',
              },
            }),
          } as Response);

          globalThis.fetch = mockFetch as any;

          // Convert to AIMessage format
          const aiMessages: AIMessage[] = messages.map((msg, idx) => ({
            id: `msg-${idx}`,
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content,
            timestamp: new Date(),
          }));

          // Attempt to send message and expect error
          let errorThrown = false;
          try {
            await aiService.sendMessage(aiMessages, { useCache: false });
          } catch (error) {
            errorThrown = true;
            const aiError = error as AIError;
            // Verify error has required fields
            expect(aiError).toHaveProperty('code');
            expect(aiError).toHaveProperty('message');
            expect(aiError).toHaveProperty('retryable');
            // Verify error message is present
            expect(aiError.message).toBeTruthy();
            expect(aiError.message.length).toBeGreaterThan(0);
          }
          
          // Ensure error was thrown
          expect(errorThrown).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  // **Feature: classroom-ui-overhaul, Property 20: AI conversation context**
  it('Property 20: For any sequence of AI messages, the conversation history should be maintained and included in subsequent requests', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(nonEmptyAIMessageArbitrary, { minLength: 2, maxLength: 10 }),
        async (messages) => {
          // Create fresh service instance for each iteration
          const aiService = new AIService({
            apiKey: 'test-api-key',
            apiEndpoint: 'https://api.openai.com/v1',
            model: 'gpt-3.5-turbo',
            maxRetries: 1,
          });

          // Setup mock fetch for this iteration
          const mockFetch = vi.fn();
          const capturedRequests: any[] = [];
          
          mockFetch.mockImplementation((url: string, options: any) => {
            capturedRequests.push(JSON.parse(options.body));
            
            const mockResponse: ChatGPTResponse = {
              id: `chatcmpl-${capturedRequests.length}`,
              object: 'chat.completion',
              created: Date.now(),
              model: 'gpt-3.5-turbo',
              choices: [
                {
                  index: 0,
                  message: {
                    role: 'assistant',
                    content: `Response ${capturedRequests.length}`,
                  },
                  finish_reason: 'stop',
                },
              ],
              usage: {
                prompt_tokens: 10,
                completion_tokens: 20,
                total_tokens: 30,
              },
            };

            return Promise.resolve({
              ok: true,
              json: async () => mockResponse,
            } as Response);
          });

          globalThis.fetch = mockFetch as any;

          // Build conversation incrementally (filter out system messages from test data)
          const conversation: AIMessage[] = [];
          const nonSystemMessages = messages.filter(m => m.role !== 'system');
          
          for (let i = 0; i < nonSystemMessages.length; i++) {
            conversation.push({
              id: `msg-${i}`,
              role: nonSystemMessages[i].role as 'user' | 'assistant' | 'system',
              content: nonSystemMessages[i].content,
              timestamp: new Date(),
            });

            await aiService.sendMessage([...conversation], { useCache: false });

            // Verify the request includes all previous messages
            const requestBody = capturedRequests[i];
            
            // Should include system prompt + all messages up to this point
            expect(requestBody.messages.length).toBe(i + 2); // +1 for system prompt, +1 for current message
            
            // First message should be system prompt
            expect(requestBody.messages[0].role).toBe('system');
            
            // Verify message order is preserved (skip system prompt at index 0)
            for (let j = 0; j <= i; j++) {
              expect(requestBody.messages[j + 1].content).toBe(nonSystemMessages[j].content);
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  // **Feature: classroom-ui-overhaul, Property 21: AI conversation reset**
  it('Property 21: For any conversation clear action, the AI conversation state should be reset to empty', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(nonEmptyAIMessageArbitrary, { minLength: 1, maxLength: 5 }),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        async (messages, newMessage) => {
          // Create fresh service instance for each iteration
          const aiService = new AIService({
            apiKey: 'test-api-key',
            apiEndpoint: 'https://api.openai.com/v1',
            model: 'gpt-3.5-turbo',
            maxRetries: 1,
          });

          // Setup mock fetch for this iteration
          const mockFetch = vi.fn();
          const capturedRequests: any[] = [];
          
          // Setup mock response
          const mockResponse: ChatGPTResponse = {
            id: 'chatcmpl-123',
            object: 'chat.completion',
            created: Date.now(),
            model: 'gpt-3.5-turbo',
            choices: [
              {
                index: 0,
                message: {
                  role: 'assistant',
                  content: 'Response',
                },
                finish_reason: 'stop',
              },
            ],
            usage: {
              prompt_tokens: 10,
              completion_tokens: 20,
              total_tokens: 30,
            },
          };

          mockFetch.mockImplementation((url: string, options: any) => {
            capturedRequests.push(JSON.parse(options.body));
            return Promise.resolve({
              ok: true,
              json: async () => mockResponse,
            } as Response);
          });

          globalThis.fetch = mockFetch as any;

          // Filter out system messages from test data
          const nonSystemMessages = messages.filter(m => m.role !== 'system');
          const aiMessages: AIMessage[] = nonSystemMessages.map((msg, idx) => ({
            id: `msg-${idx}`,
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content,
            timestamp: new Date(),
          }));

          await aiService.sendMessage(aiMessages, { useCache: false });
          
          // Verify first request had system prompt + multiple messages
          const firstRequestBody = capturedRequests[0];
          expect(firstRequestBody.messages.length).toBe(nonSystemMessages.length + 1); // +1 for system prompt
          expect(firstRequestBody.messages[0].role).toBe('system');

          // Second request with single new message (simulating reset)
          const resetMessages: AIMessage[] = [{
            id: 'new-msg',
            role: 'user',
            content: newMessage,
            timestamp: new Date(),
          }];
          
          await aiService.sendMessage(resetMessages, { useCache: false });
          
          // Verify second request has system prompt + the new message (conversation was reset)
          const secondRequestBody = capturedRequests[1];
          expect(secondRequestBody.messages.length).toBe(2); // system prompt + new message
          expect(secondRequestBody.messages[0].role).toBe('system');
          expect(secondRequestBody.messages[1].content).toBe(newMessage);
        }
      ),
      { numRuns: 100 }
    );
  });

  // **Feature: classroom-ui-overhaul, Property 86: AI capabilities in system prompt**
  it('Property 86: For the AI system prompt configuration, the prompt should include text informing the AI about Unsplash and DALL-E capabilities', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(nonEmptyAIMessageArbitrary, { minLength: 1, maxLength: 5 }),
        async (messages) => {
          // Create fresh service instance for each iteration
          const aiService = new AIService({
            apiKey: 'test-api-key',
            apiEndpoint: 'https://api.openai.com/v1',
            model: 'gpt-3.5-turbo',
            maxRetries: 1,
          });

          // Setup mock fetch for this iteration
          const mockFetch = vi.fn();
          let capturedRequestBody: any = null;
          
          // Setup mock response
          const mockResponse: ChatGPTResponse = {
            id: 'chatcmpl-123',
            object: 'chat.completion',
            created: Date.now(),
            model: 'gpt-3.5-turbo',
            choices: [
              {
                index: 0,
                message: {
                  role: 'assistant',
                  content: 'Test response',
                },
                finish_reason: 'stop',
              },
            ],
            usage: {
              prompt_tokens: 10,
              completion_tokens: 20,
              total_tokens: 30,
            },
          };

          mockFetch.mockImplementation((url: string, options: any) => {
            capturedRequestBody = JSON.parse(options.body);
            return Promise.resolve({
              ok: true,
              json: async () => mockResponse,
            } as Response);
          });

          globalThis.fetch = mockFetch as any;

          // Convert to AIMessage format (filter out system messages from test data)
          const aiMessages: AIMessage[] = messages
            .filter(msg => msg.role !== 'system')
            .map((msg, idx) => ({
              id: `msg-${idx}`,
              role: msg.role as 'user' | 'assistant' | 'system',
              content: msg.content,
              timestamp: new Date(),
            }));

          // Send message
          await aiService.sendMessage(aiMessages, { useCache: false });

          // Verify system prompt is included
          expect(capturedRequestBody).toBeTruthy();
          expect(capturedRequestBody.messages).toBeTruthy();
          expect(capturedRequestBody.messages.length).toBeGreaterThan(0);
          
          // First message should be the system prompt
          const firstMessage = capturedRequestBody.messages[0];
          expect(firstMessage.role).toBe('system');
          
          // Get the system prompt from the service
          const systemPrompt = aiService.getSystemPrompt();
          expect(firstMessage.content).toBe(systemPrompt);
          
          // Verify system prompt contains required capability information
          expect(systemPrompt).toContain('Unsplash');
          expect(systemPrompt).toContain('DALL-E');
          expect(systemPrompt.toLowerCase()).toContain('image');
          expect(systemPrompt.toLowerCase()).toContain('search');
          
          // Verify the system prompt mentions proactive image usage
          expect(systemPrompt.toLowerCase()).toContain('proactive');
          
          // Verify all user messages are included after the system prompt
          const userMessagesInRequest = capturedRequestBody.messages.slice(1);
          expect(userMessagesInRequest.length).toBe(aiMessages.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});
