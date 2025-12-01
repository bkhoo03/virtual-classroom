/**
 * Complete AI Workflow Integration Test
 * 
 * This test verifies the complete AI workflow including:
 * - Sending queries from different presentation modes
 * - Auto-switch to AI output mode
 * - State preservation and restoration
 * - History display and persistence
 * - All animations
 * - Reduced motion support
 * - Multiple queries in sequence
 * 
 * **Validates: All AI UX requirements (Requirements 16.*, 17.*, 18.*)**
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import AIService from '../services/AIService';
import { AIOutputHistoryManager } from '../services/AIOutputHistoryManager';
import PresentationModeManager, {
  getPresentationModeManager,
  resetPresentationModeManager,
  type PDFState,
  type WhiteboardState,
} from '../services/PresentationModeManager';
import { AIAnimationController } from '../utils/AIAnimationController';
import type { AIMessage, ChatGPTResponse } from '../types/ai.types';
import type { PresentationMode } from '../types';
import { delay } from './helpers/pbt-helpers';

// ============================================================================
// Test Setup and Utilities
// ============================================================================

describe('Complete AI Workflow Integration Tests', () => {
  let aiService: AIService;
  let historyManager: AIOutputHistoryManager;
  let modeManager: PresentationModeManager;
  let animationController: AIAnimationController;
  let testContainer: HTMLElement;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    // Clear sessionStorage
    sessionStorage.clear();

    // Initialize services
    aiService = new AIService({
      apiKey: 'test-api-key',
      apiEndpoint: 'https://api.openai.com/v1',
      model: 'gpt-3.5-turbo',
      maxRetries: 1,
    });

    historyManager = new AIOutputHistoryManager({
      maxEntries: 50,
      persistToSession: true,
      autoScroll: true,
    });

    resetPresentationModeManager();
    modeManager = getPresentationModeManager();
    modeManager.reset();

    animationController = new AIAnimationController();

    // Create test container for DOM tests
    testContainer = document.createElement('div');
    document.body.appendChild(testContainer);

    // Mock matchMedia for animation tests
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    // Cleanup
    globalThis.fetch = originalFetch;
    document.body.removeChild(testContainer);
    sessionStorage.clear();
    modeManager.reset();
    resetPresentationModeManager();
    vi.restoreAllMocks();
  });

  // ============================================================================
  // Test 1: Complete workflow from PDF mode
  // ============================================================================

  it('should handle complete AI workflow from PDF mode', async () => {
    // Setup mock fetch
    const mockFetch = vi.fn();
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
            content: 'This is a test response about quantum physics.',
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

    // 1. Start in PDF mode with specific state
    await modeManager.switchMode('pdf');
    const pdfState: PDFState = {
      currentPage: 5,
      zoom: 1.5,
      scrollPosition: { x: 100, y: 200 },
    };
    modeManager.preservePDFState(pdfState);
    expect(modeManager.getCurrentMode()).toBe('pdf');

    // 2. Send AI query
    const userMessage: AIMessage = {
      id: 'msg-1',
      role: 'user',
      content: 'Explain quantum entanglement',
      timestamp: new Date(),
    };

    // 3. Auto-switch to AI output mode
    await modeManager.autoSwitchToAIOutput();
    expect(modeManager.getCurrentMode()).toBe('ai-output');
    expect(modeManager.getPreviousMode()).toBe('pdf');

    // 4. Get AI response
    const response = await aiService.sendMessage([userMessage], { useCache: false });
    expect(response.choices[0].message.content).toBe(mockResponse.choices[0].message.content);

    // 5. Add to history
    historyManager.addEntry({
      id: 'entry-1',
      timestamp: new Date(),
      userQuery: userMessage.content,
      textResponse: response.choices[0].message.content,
      images: [],
      searchResults: [],
      processingTime: 1500,
    });

    // 6. Verify history
    const history = historyManager.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].userQuery).toBe('Explain quantum entanglement');
    expect(history[0].textResponse).toContain('quantum physics');

    // 7. Verify PDF state was preserved
    const restoredPdfState = modeManager.restorePDFState();
    expect(restoredPdfState).not.toBeNull();
    expect(restoredPdfState?.currentPage).toBe(5);
    expect(restoredPdfState?.zoom).toBe(1.5);
    expect(restoredPdfState?.scrollPosition).toEqual({ x: 100, y: 200 });

    // 8. Return to PDF mode
    await modeManager.returnToPreviousMode();
    expect(modeManager.getCurrentMode()).toBe('pdf');

    // 9. Verify state restoration
    const finalPdfState = modeManager.restorePDFState();
    expect(finalPdfState?.currentPage).toBe(5);
    expect(finalPdfState?.zoom).toBe(1.5);
  });

  // ============================================================================
  // Test 2: Complete workflow from whiteboard mode
  // ============================================================================

  it('should handle complete AI workflow from whiteboard mode', async () => {
    // Setup mock fetch
    const mockFetch = vi.fn();
    const mockResponse: ChatGPTResponse = {
      id: 'chatcmpl-456',
      object: 'chat.completion',
      created: Date.now(),
      model: 'gpt-3.5-turbo',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: 'Here is an explanation of the Pythagorean theorem.',
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 15,
        completion_tokens: 25,
        total_tokens: 40,
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    globalThis.fetch = mockFetch as any;

    // 1. Start in whiteboard mode with specific state
    await modeManager.switchMode('whiteboard');
    const whiteboardState: WhiteboardState = {
      canUndo: true,
      canRedo: false,
    };
    modeManager.preserveWhiteboardState(whiteboardState);
    expect(modeManager.getCurrentMode()).toBe('whiteboard');

    // 2. Send AI query
    const userMessage: AIMessage = {
      id: 'msg-2',
      role: 'user',
      content: 'Explain the Pythagorean theorem',
      timestamp: new Date(),
    };

    // 3. Auto-switch to AI output mode
    await modeManager.autoSwitchToAIOutput();
    expect(modeManager.getCurrentMode()).toBe('ai-output');
    expect(modeManager.getPreviousMode()).toBe('whiteboard');

    // 4. Get AI response
    const response = await aiService.sendMessage([userMessage], { useCache: false });

    // 5. Add to history
    historyManager.addEntry({
      id: 'entry-2',
      timestamp: new Date(),
      userQuery: userMessage.content,
      textResponse: response.choices[0].message.content,
      images: [],
      searchResults: [],
      processingTime: 1200,
    });

    // 6. Verify whiteboard state was preserved
    const restoredWhiteboardState = modeManager.restoreWhiteboardState();
    expect(restoredWhiteboardState).not.toBeNull();
    expect(restoredWhiteboardState?.canUndo).toBe(true);
    expect(restoredWhiteboardState?.canRedo).toBe(false);

    // 7. Return to whiteboard mode
    await modeManager.returnToPreviousMode();
    expect(modeManager.getCurrentMode()).toBe('whiteboard');
  });

  // ============================================================================
  // Test 3: Multiple queries in sequence
  // ============================================================================

  it('should handle multiple AI queries in sequence', async () => {
    // Setup mock fetch
    let callCount = 0;
    const mockFetch = vi.fn();
    mockFetch.mockImplementation(() => {
      callCount++;
      const mockResponse: ChatGPTResponse = {
        id: `chatcmpl-${callCount}`,
        object: 'chat.completion',
        created: Date.now(),
        model: 'gpt-3.5-turbo',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: `Response ${callCount}`,
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

    // Start in PDF mode
    await modeManager.switchMode('pdf');
    const pdfState: PDFState = {
      currentPage: 3,
      zoom: 1.0,
      scrollPosition: { x: 0, y: 0 },
    };
    modeManager.preservePDFState(pdfState);

    // Send 3 queries in sequence
    const queries = [
      'What is machine learning?',
      'Explain neural networks',
      'What is deep learning?',
    ];

    for (let i = 0; i < queries.length; i++) {
      // Auto-switch to AI output
      await modeManager.autoSwitchToAIOutput();
      expect(modeManager.getCurrentMode()).toBe('ai-output');

      // Send query
      const userMessage: AIMessage = {
        id: `msg-${i + 1}`,
        role: 'user',
        content: queries[i],
        timestamp: new Date(),
      };

      const response = await aiService.sendMessage([userMessage], { useCache: false });

      // Add to history
      historyManager.addEntry({
        id: `entry-${i + 1}`,
        timestamp: new Date(),
        userQuery: queries[i],
        textResponse: response.choices[0].message.content,
        images: [],
        searchResults: [],
        processingTime: 1000 + i * 100,
      });

      // Small delay between queries
      await delay(50);
    }

    // Verify all queries are in history
    const history = historyManager.getHistory();
    expect(history).toHaveLength(3);
    expect(history[0].userQuery).toBe(queries[2]); // Newest first
    expect(history[1].userQuery).toBe(queries[1]);
    expect(history[2].userQuery).toBe(queries[0]); // Oldest last

    // Verify PDF state is still preserved
    const restoredPdfState = modeManager.restorePDFState();
    expect(restoredPdfState?.currentPage).toBe(3);

    // Return to PDF mode
    await modeManager.returnToPreviousMode();
    expect(modeManager.getCurrentMode()).toBe('pdf');
  });

  // ============================================================================
  // Test 4: History persistence across refresh
  // ============================================================================

  it('should persist history across page refresh', async () => {
    // Add entries to history
    for (let i = 0; i < 3; i++) {
      historyManager.addEntry({
        id: `entry-${i}`,
        timestamp: new Date(Date.now() + i * 1000),
        userQuery: `Query ${i}`,
        textResponse: `Response ${i}`,
        images: [],
        searchResults: [],
        processingTime: 1000,
      });
    }

    // Verify entries are in history
    expect(historyManager.getHistoryCount()).toBe(3);

    // Simulate page refresh by creating new history manager
    const newHistoryManager = new AIOutputHistoryManager({
      maxEntries: 50,
      persistToSession: true,
    });

    // Verify history was restored
    const restoredHistory = newHistoryManager.getHistory();
    expect(restoredHistory).toHaveLength(3);
    expect(restoredHistory[0].userQuery).toBe('Query 2'); // Newest first
    expect(restoredHistory[1].userQuery).toBe('Query 1');
    expect(restoredHistory[2].userQuery).toBe('Query 0'); // Oldest last
  });

  // ============================================================================
  // Test 5: Animations with normal motion
  // ============================================================================

  it('should apply animations when motion is not reduced', async () => {
    // Mock prefers-reduced-motion to false
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    expect(animationController.shouldAnimate()).toBe(true);

    // Test panel slide-in
    const panel = document.createElement('div');
    testContainer.appendChild(panel);

    const slidePromise = animationController.slideInPanel(panel, { duration: 300 });
    await delay(50);
    expect(panel.style.transition).toContain('300ms');
    await slidePromise;
    expect(panel.style.transform).toBe('translateX(0)');

    // Test typewriter effect
    const textElement = document.createElement('div');
    testContainer.appendChild(textElement);

    const text = 'Test response';
    await animationController.typewriterEffect(textElement, text, {
      speed: 100,
      cursor: false,
    });
    expect(textElement.textContent).toBe(text);

    // Test image fade-in
    const image = document.createElement('img');
    testContainer.appendChild(image);

    const fadePromise = animationController.fadeInImage(image, { duration: 400 });
    await delay(50);
    expect(image.style.transition).toContain('opacity');
    await fadePromise;
    expect(image.style.opacity).toBe('1');
  });

  // ============================================================================
  // Test 6: Animations with reduced motion
  // ============================================================================

  it('should respect prefers-reduced-motion setting', async () => {
    // Mock prefers-reduced-motion to true
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    expect(animationController.shouldAnimate()).toBe(false);

    // Test panel slide-in (should complete instantly)
    const panel = document.createElement('div');
    testContainer.appendChild(panel);

    const startTime = Date.now();
    await animationController.slideInPanel(panel);
    const endTime = Date.now();

    expect(endTime - startTime).toBeLessThan(50); // Should be instant
    expect(panel.style.transform).toBe('translateX(0)');
    expect(panel.style.opacity).toBe('1');

    // Test typewriter effect (should complete instantly)
    const textElement = document.createElement('div');
    testContainer.appendChild(textElement);

    const text = 'Test response';
    const startTime2 = Date.now();
    await animationController.typewriterEffect(textElement, text);
    const endTime2 = Date.now();

    expect(endTime2 - startTime2).toBeLessThan(50); // Should be instant
    expect(textElement.textContent).toBe(text);
  });

  // ============================================================================
  // Test 7: Loading indicators
  // ============================================================================

  it('should display loading indicators during AI processing', () => {
    const container = document.createElement('div');
    testContainer.appendChild(container);

    // Show spinner
    animationController.showLoadingIndicator(container, 'spinner');
    let indicator = container.querySelector('[data-loading-indicator="true"]');
    expect(indicator).toBeTruthy();
    expect(indicator?.classList.contains('ai-loading-spinner')).toBe(true);

    // Hide indicator
    animationController.hideLoadingIndicator(container);
    indicator = container.querySelector('[data-loading-indicator="true"]');
    expect(indicator).toBeNull();

    // Show dots
    animationController.showLoadingIndicator(container, 'dots');
    indicator = container.querySelector('[data-loading-indicator="true"]');
    expect(indicator).toBeTruthy();
    expect(indicator?.classList.contains('ai-loading-dots')).toBe(true);

    // Hide indicator
    animationController.hideLoadingIndicator(container);

    // Show pulse
    animationController.showLoadingIndicator(container, 'pulse');
    indicator = container.querySelector('[data-loading-indicator="true"]');
    expect(indicator).toBeTruthy();
    expect(indicator?.classList.contains('ai-loading-pulse')).toBe(true);
  });

  // ============================================================================
  // Test 8: Property-based test for complete workflow
  // ============================================================================

  it('should handle complete workflow for any presentation mode', async () => {
    const presentationModeArb = fc.constantFrom<PresentationMode>(
      'pdf',
      'whiteboard',
      'screenshare'
    );

    await fc.assert(
      fc.asyncProperty(
        presentationModeArb,
        fc.string({ minLength: 5, maxLength: 100 }),
        async (startMode, query) => {
          // Reset state
          resetPresentationModeManager();
          const testModeManager = getPresentationModeManager();
          testModeManager.reset();
          sessionStorage.clear();
          const testHistoryManager = new AIOutputHistoryManager({
            maxEntries: 50,
            persistToSession: false,
          });

          // Setup mock fetch
          const mockFetch = vi.fn();
          const mockResponse: ChatGPTResponse = {
            id: 'chatcmpl-test',
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

          mockFetch.mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
          } as Response);

          globalThis.fetch = mockFetch as any;

          // 1. Start in given mode
          await testModeManager.switchMode(startMode);
          expect(testModeManager.getCurrentMode()).toBe(startMode);

          // 2. Auto-switch to AI output
          await testModeManager.autoSwitchToAIOutput();
          expect(testModeManager.getCurrentMode()).toBe('ai-output');
          expect(testModeManager.getPreviousMode()).toBe(startMode);

          // 3. Send query
          const userMessage: AIMessage = {
            id: 'msg-test',
            role: 'user',
            content: query,
            timestamp: new Date(),
          };

          const testAiService = new AIService({
            apiKey: 'test-api-key',
            apiEndpoint: 'https://api.openai.com/v1',
            model: 'gpt-3.5-turbo',
            maxRetries: 1,
          });

          const response = await testAiService.sendMessage([userMessage], {
            useCache: false,
          });

          // 4. Add to history
          testHistoryManager.addEntry({
            id: 'entry-test',
            timestamp: new Date(),
            userQuery: query,
            textResponse: response.choices[0].message.content,
            images: [],
            searchResults: [],
            processingTime: 1000,
          });

          // 5. Verify history
          const history = testHistoryManager.getHistory();
          expect(history).toHaveLength(1);
          expect(history[0].userQuery).toBe(query);

          // 6. Return to previous mode
          await testModeManager.returnToPreviousMode();
          expect(testModeManager.getCurrentMode()).toBe(startMode);

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  // ============================================================================
  // Test 9: Auto-scroll behavior
  // ============================================================================

  it('should auto-scroll to newest entry when enabled', () => {
    const managerWithScroll = new AIOutputHistoryManager({
      maxEntries: 50,
      persistToSession: false,
      autoScroll: true,
    });

    expect(managerWithScroll.shouldAutoScroll()).toBe(true);

    // Add entries
    for (let i = 0; i < 5; i++) {
      managerWithScroll.addEntry({
        id: `entry-${i}`,
        timestamp: new Date(Date.now() + i * 1000),
        userQuery: `Query ${i}`,
        textResponse: `Response ${i}`,
        images: [],
        searchResults: [],
        processingTime: 1000,
      });
    }

    // Newest entry should be first
    const history = managerWithScroll.getHistory();
    expect(history[0].userQuery).toBe('Query 4');
  });

  // ============================================================================
  // Test 10: Conversation context preservation
  // ============================================================================

  it('should maintain conversation context across multiple queries', async () => {
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

    // Send multiple messages
    const conversation: AIMessage[] = [];

    for (let i = 0; i < 3; i++) {
      conversation.push({
        id: `msg-${i}`,
        role: 'user',
        content: `Message ${i}`,
        timestamp: new Date(),
      });

      await aiService.sendMessage([...conversation], { useCache: false });

      // Verify conversation history is included
      const requestBody = capturedRequests[i];
      expect(requestBody.messages.length).toBe(i + 2); // system prompt + messages
      expect(requestBody.messages[0].role).toBe('system');
    }
  });
});
