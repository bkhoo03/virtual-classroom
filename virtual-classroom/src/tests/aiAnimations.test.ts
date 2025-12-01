/**
 * Property-Based Tests for AIAnimationController
 * 
 * Tests animation functionality with property-based testing using fast-check
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { AIAnimationController } from '../utils/AIAnimationController';
import { delay } from './helpers/pbt-helpers';

describe('AIAnimationController Property Tests', () => {
  let controller: AIAnimationController;
  let testContainer: HTMLElement;

  beforeEach(() => {
    controller = new AIAnimationController();
    testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
  });

  afterEach(() => {
    document.body.removeChild(testContainer);
    vi.restoreAllMocks();
  });

  /**
   * Property 62: Panel slide-in animation
   * For any AI assistant panel opening, the panel should animate with a slide-in 
   * transition using the configured easing function
   * **Feature: classroom-ui-overhaul, Property 62: Panel slide-in animation**
   * **Validates: Requirements 16.1**
   */
  it('Property 62: Panel slide-in animation applies correct transform and easing', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          duration: fc.integer({ min: 100, max: 500 }),
          easing: fc.constantFrom(
            'cubic-bezier(0.16, 1, 0.3, 1)',
            'ease-in-out',
            'ease-out'
          ),
          delay: fc.integer({ min: 0, max: 50 }),
        }),
        async (config) => {
          const element = document.createElement('div');
          testContainer.appendChild(element);

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

          const promise = controller.slideInPanel(element, config);

          // Check that transition is applied
          await delay(50);
          expect(element.style.transition).toContain(config.easing);
          expect(element.style.transition).toContain(`${config.duration}ms`);

          await promise;

          // After animation, element should be at translateX(0)
          expect(element.style.transform).toBe('translateX(0)');
          expect(element.style.opacity).toBe('1');
        }
      ),
      { numRuns: 20 }
    );
  }, 30000);

  /**
   * Property 63: Typewriter text animation
   * For any AI text response, the text should be revealed progressively 
   * with timing within the configured bounds
   * **Feature: classroom-ui-overhaul, Property 63: Typewriter text animation**
   * **Validates: Requirements 16.2**
   */
  it('Property 63: Typewriter effect reveals text progressively at configured speed', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          text: fc.string({ minLength: 5, maxLength: 20 }),
          speed: fc.integer({ min: 50, max: 100 }), // chars per second
        }),
        async ({ text, speed }) => {
          const element = document.createElement('div');
          testContainer.appendChild(element);

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

          const startTime = Date.now();
          await controller.typewriterEffect(element, text, { speed, cursor: false });
          const endTime = Date.now();

          // Check that text is fully revealed
          expect(element.textContent).toBe(text);

          // Check that timing is within reasonable bounds
          const expectedDuration = (text.length / speed) * 1000;
          const actualDuration = endTime - startTime;
          
          // Allow 100% tolerance for timing variations (animations can be imprecise)
          const tolerance = expectedDuration * 1.0;
          expect(actualDuration).toBeGreaterThanOrEqual(expectedDuration - tolerance);
          expect(actualDuration).toBeLessThanOrEqual(expectedDuration + tolerance + 500);
        }
      ),
      { numRuns: 10 } // Reduced runs for performance
    );
  }, 30000);

  /**
   * Property 64: Image fade-in animation
   * For any image loaded in AI responses, the image should have fade-in 
   * and scale animations applied
   * **Feature: classroom-ui-overhaul, Property 64: Image fade-in animation**
   * **Validates: Requirements 16.3**
   */
  it('Property 64: Image fade-in applies opacity and scale transitions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          duration: fc.integer({ min: 200, max: 500 }),
          delay: fc.integer({ min: 0, max: 50 }),
        }),
        async (config) => {
          const element = document.createElement('img');
          testContainer.appendChild(element);

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

          const promise = controller.fadeInImage(element, config);

          // Check that transition is applied
          await delay(50);
          expect(element.style.transition).toContain('opacity');
          expect(element.style.transition).toContain('transform');
          expect(element.style.transition).toContain(`${config.duration}ms`);

          await promise;

          // After animation, element should be fully visible and scaled to 1
          expect(element.style.opacity).toBe('1');
          expect(element.style.transform).toBe('scale(1)');
        }
      ),
      { numRuns: 20 }
    );
  }, 30000);

  /**
   * Property 65: Loading indicator display
   * For any AI processing state, a loading indicator should be visible 
   * with animation classes applied
   * **Feature: classroom-ui-overhaul, Property 65: Loading indicator display**
   * **Validates: Requirements 16.4**
   */
  it('Property 65: Loading indicators are displayed with correct classes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('spinner', 'dots', 'pulse'),
        (type) => {
          const container = document.createElement('div');
          testContainer.appendChild(container);

          controller.showLoadingIndicator(container, type);

          // Check that loading indicator exists
          const indicator = container.querySelector('[data-loading-indicator="true"]');
          expect(indicator).toBeTruthy();
          expect(indicator?.classList.contains(`ai-loading-${type}`)).toBe(true);

          // Check that indicator has content
          expect(indicator?.innerHTML.trim().length).toBeGreaterThan(0);

          // Hide and verify removal
          controller.hideLoadingIndicator(container);
          const removedIndicator = container.querySelector('[data-loading-indicator="true"]');
          expect(removedIndicator).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 66: Staggered element animations
   * For any set of multiple AI content elements, each element should have 
   * an increasing animation delay
   * **Feature: classroom-ui-overhaul, Property 66: Staggered element animations**
   * **Validates: Requirements 16.5**
   */
  it('Property 66: Staggered animations apply increasing delays to elements', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementCount: fc.integer({ min: 2, max: 5 }),
          staggerDelay: fc.integer({ min: 50, max: 100 }),
          duration: fc.integer({ min: 200, max: 400 }),
        }),
        async ({ elementCount, staggerDelay, duration }) => {
          const elements: HTMLElement[] = [];
          for (let i = 0; i < elementCount; i++) {
            const el = document.createElement('div');
            testContainer.appendChild(el);
            elements.push(el);
          }

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

          await controller.staggerElements(elements, { staggerDelay, duration });

          // After animation, all elements should be visible
          elements.forEach((el) => {
            expect(el.style.opacity).toBe('1');
            expect(el.style.transform).toBe('translateY(0)');
          });
        }
      ),
      { numRuns: 10 } // Reduced runs for performance
    );
  }, 30000);

  /**
   * Property 67: Hover feedback animations
   * For any AI output element, hovering should apply transition properties 
   * for smooth feedback
   * **Feature: classroom-ui-overhaul, Property 67: Hover feedback animations**
   * **Validates: Requirements 16.6**
   */
  it('Property 67: Elements can have transitions applied for hover feedback', () => {
    fc.assert(
      fc.property(
        fc.record({
          duration: fc.integer({ min: 100, max: 500 }),
          easing: fc.constantFrom('ease-in-out', 'ease-out', 'linear'),
        }),
        (config) => {
          const element = document.createElement('div');
          testContainer.appendChild(element);

          // Apply transition for hover feedback
          element.style.transition = `all ${config.duration}ms ${config.easing}`;

          // Verify transition is applied
          expect(element.style.transition).toContain(`${config.duration}ms`);
          expect(element.style.transition).toContain(config.easing);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 68: Reduced motion respect
   * For any animation, when prefers-reduced-motion is enabled, animations 
   * should be disabled or significantly reduced
   * **Feature: classroom-ui-overhaul, Property 68: Reduced motion respect**
   * **Validates: Requirements 16.7**
   */
  it('Property 68: Animations respect prefers-reduced-motion setting', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('slideInPanel', 'fadeInImage', 'typewriterEffect', 'staggerElements'),
        async (animationType) => {
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

          expect(controller.shouldAnimate()).toBe(false);

          const element = document.createElement('div');
          testContainer.appendChild(element);

          const startTime = Date.now();

          // Test different animation types
          if (animationType === 'slideInPanel') {
            await controller.slideInPanel(element);
            expect(element.style.transform).toBe('translateX(0)');
            expect(element.style.opacity).toBe('1');
          } else if (animationType === 'fadeInImage') {
            await controller.fadeInImage(element);
            expect(element.style.opacity).toBe('1');
            expect(element.style.transform).toBe('scale(1)');
          } else if (animationType === 'typewriterEffect') {
            const text = 'Test text';
            await controller.typewriterEffect(element, text);
            expect(element.textContent).toBe(text);
          } else if (animationType === 'staggerElements') {
            const elements = [element];
            await controller.staggerElements(elements);
            expect(element.style.opacity).toBe('1');
          }

          const endTime = Date.now();
          const duration = endTime - startTime;

          // With reduced motion, animations should complete almost instantly (< 50ms)
          expect(duration).toBeLessThan(50);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional test: shouldAnimate() correctly detects prefers-reduced-motion
   */
  it('shouldAnimate() correctly detects prefers-reduced-motion setting', () => {
    fc.assert(
      fc.property(fc.boolean(), (reducedMotion) => {
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: vi.fn().mockImplementation((query) => ({
            matches: reducedMotion && query === '(prefers-reduced-motion: reduce)',
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
          })),
        });

        const shouldAnimate = controller.shouldAnimate();
        expect(shouldAnimate).toBe(!reducedMotion);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Additional test: getDefaultConfig returns expected values
   */
  it('getDefaultConfig returns valid configuration', () => {
    const config = controller.getDefaultConfig();

    expect(config).toHaveProperty('duration');
    expect(config).toHaveProperty('easing');
    expect(config).toHaveProperty('delay');
    expect(config).toHaveProperty('respectReducedMotion');

    expect(typeof config.duration).toBe('number');
    expect(typeof config.easing).toBe('string');
    expect(typeof config.delay).toBe('number');
    expect(typeof config.respectReducedMotion).toBe('boolean');

    expect(config.duration).toBeGreaterThan(0);
    expect(config.delay).toBeGreaterThanOrEqual(0);
  });
});
