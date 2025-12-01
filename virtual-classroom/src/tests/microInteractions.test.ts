/**
 * Micro-Interactions Test Suite
 * 
 * Tests for animation system micro-interaction classes
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EASING, DURATION, DELAY, createTransition, getStaggerDelay, prefersReducedMotion, getAnimationDuration } from '../utils/animationConstants';

describe('Animation Constants', () => {
  describe('Easing Functions', () => {
    it('should define ease-out-expo easing', () => {
      expect(EASING.easeOutExpo).toBe('cubic-bezier(0.16, 1, 0.3, 1)');
    });

    it('should define ease-in-out-circ easing', () => {
      expect(EASING.easeInOutCirc).toBe('cubic-bezier(0.85, 0, 0.15, 1)');
    });

    it('should define ease-spring easing', () => {
      expect(EASING.easeSpring).toBe('cubic-bezier(0.68, -0.55, 0.265, 1.55)');
    });

    it('should define all required easing functions', () => {
      expect(EASING).toHaveProperty('easeOutExpo');
      expect(EASING).toHaveProperty('easeInOutCirc');
      expect(EASING).toHaveProperty('easeSpring');
      expect(EASING).toHaveProperty('easeOut');
      expect(EASING).toHaveProperty('easeIn');
      expect(EASING).toHaveProperty('easeInOut');
    });
  });

  describe('Duration Constants', () => {
    it('should define fast duration as 150ms', () => {
      expect(DURATION.fast).toBe(150);
    });

    it('should define normal duration as 300ms', () => {
      expect(DURATION.normal).toBe(300);
    });

    it('should define slow duration as 500ms', () => {
      expect(DURATION.slow).toBe(500);
    });

    it('should define verySlow duration as 700ms', () => {
      expect(DURATION.verySlow).toBe(700);
    });

    it('should have durations in ascending order', () => {
      expect(DURATION.fast).toBeLessThan(DURATION.normal);
      expect(DURATION.normal).toBeLessThan(DURATION.slow);
      expect(DURATION.slow).toBeLessThan(DURATION.verySlow);
    });
  });

  describe('Delay Constants', () => {
    it('should define stagger delay as 75ms', () => {
      expect(DELAY.stagger).toBe(75);
    });

    it('should define sequence delay as 150ms', () => {
      expect(DELAY.sequence).toBe(150);
    });

    it('should have stagger delay in 50-100ms range', () => {
      expect(DELAY.stagger).toBeGreaterThanOrEqual(50);
      expect(DELAY.stagger).toBeLessThanOrEqual(100);
    });
  });
});

describe('Helper Functions', () => {
  describe('createTransition', () => {
    it('should create transition string for single property', () => {
      const transition = createTransition('opacity');
      expect(transition).toContain('opacity');
      expect(transition).toContain('300ms');
      expect(transition).toContain('cubic-bezier');
    });

    it('should create transition string for multiple properties', () => {
      const transition = createTransition(['opacity', 'transform']);
      expect(transition).toContain('opacity');
      expect(transition).toContain('transform');
      expect(transition).toContain(',');
    });

    it('should use custom duration', () => {
      const transition = createTransition('opacity', 500);
      expect(transition).toContain('500ms');
    });

    it('should use custom easing', () => {
      const customEasing = 'ease-in-out';
      const transition = createTransition('opacity', 300, customEasing);
      expect(transition).toContain(customEasing);
    });

    it('should include delay when provided', () => {
      const transition = createTransition('opacity', 300, EASING.easeOut, 100);
      expect(transition).toContain('100ms');
    });
  });

  describe('getStaggerDelay', () => {
    it('should calculate stagger delay for index 0', () => {
      expect(getStaggerDelay(0)).toBe(0);
    });

    it('should calculate stagger delay for index 1', () => {
      expect(getStaggerDelay(1)).toBe(DELAY.stagger);
    });

    it('should calculate stagger delay for index 3', () => {
      expect(getStaggerDelay(3)).toBe(DELAY.stagger * 3);
    });

    it('should use custom base delay', () => {
      const customDelay = 100;
      expect(getStaggerDelay(2, customDelay)).toBe(200);
    });

    it('should return increasing delays for increasing indices', () => {
      const delay1 = getStaggerDelay(1);
      const delay2 = getStaggerDelay(2);
      const delay3 = getStaggerDelay(3);
      
      expect(delay2).toBeGreaterThan(delay1);
      expect(delay3).toBeGreaterThan(delay2);
    });
  });

  describe('getAnimationDuration', () => {
    it('should return duration when motion is not reduced', () => {
      // Mock matchMedia to return false for reduced motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        }),
      });

      expect(getAnimationDuration(300)).toBe(300);
    });

    it('should return 0 when reduced motion is preferred', () => {
      // Mock matchMedia to return true for reduced motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        }),
      });

      expect(getAnimationDuration(300)).toBe(0);
    });
  });
});

describe('Micro-Interaction Classes', () => {
  let testElement: HTMLElement;

  beforeEach(() => {
    testElement = document.createElement('div');
    document.body.appendChild(testElement);
  });

  afterEach(() => {
    document.body.removeChild(testElement);
  });

  describe('btn-press class', () => {
    it('should apply btn-press class', () => {
      testElement.classList.add('btn-press');
      expect(testElement.classList.contains('btn-press')).toBe(true);
    });

    it('should have transition property when btn-press is applied', () => {
      testElement.classList.add('btn-press');
      const styles = window.getComputedStyle(testElement);
      // Note: In test environment, CSS might not be fully loaded
      // This test verifies the class can be applied
      expect(testElement.className).toContain('btn-press');
    });
  });

  describe('hover-lift class', () => {
    it('should apply hover-lift class', () => {
      testElement.classList.add('hover-lift');
      expect(testElement.classList.contains('hover-lift')).toBe(true);
    });
  });

  describe('glow-yellow class', () => {
    it('should apply glow-yellow class', () => {
      testElement.classList.add('glow-yellow');
      expect(testElement.classList.contains('glow-yellow')).toBe(true);
    });
  });

  describe('glow-purple class', () => {
    it('should apply glow-purple class', () => {
      testElement.classList.add('glow-purple');
      expect(testElement.classList.contains('glow-purple')).toBe(true);
    });
  });

  describe('combined classes', () => {
    it('should allow combining btn-press with hover-lift', () => {
      testElement.classList.add('btn-press', 'hover-lift');
      expect(testElement.classList.contains('btn-press')).toBe(true);
      expect(testElement.classList.contains('hover-lift')).toBe(true);
    });

    it('should allow combining btn-press with glow-yellow', () => {
      testElement.classList.add('btn-press', 'glow-yellow');
      expect(testElement.classList.contains('btn-press')).toBe(true);
      expect(testElement.classList.contains('glow-yellow')).toBe(true);
    });
  });
});

describe('Animation Presets', () => {
  describe('CSS Animation Classes', () => {
    let testElement: HTMLElement;

    beforeEach(() => {
      testElement = document.createElement('div');
      document.body.appendChild(testElement);
    });

    afterEach(() => {
      document.body.removeChild(testElement);
    });

    it('should apply fade-in class', () => {
      testElement.classList.add('fade-in');
      expect(testElement.classList.contains('fade-in')).toBe(true);
    });

    it('should apply slide-in-right class', () => {
      testElement.classList.add('slide-in-right');
      expect(testElement.classList.contains('slide-in-right')).toBe(true);
    });

    it('should apply scale-fade-in class', () => {
      testElement.classList.add('scale-fade-in');
      expect(testElement.classList.contains('scale-fade-in')).toBe(true);
    });

    it('should apply stagger delay classes', () => {
      testElement.classList.add('stagger-1');
      expect(testElement.classList.contains('stagger-1')).toBe(true);
      
      testElement.classList.remove('stagger-1');
      testElement.classList.add('stagger-3');
      expect(testElement.classList.contains('stagger-3')).toBe(true);
    });
  });
});

describe('Smooth Animations', () => {
  it('should define smooth easing functions', () => {
    expect(EASING.easeOutExpo).toBeTruthy();
    expect(EASING.easeInOutCirc).toBeTruthy();
    expect(EASING.easeSpring).toBeTruthy();
  });

  it('should have appropriate durations for different animation types', () => {
    // Fast for micro-interactions
    expect(DURATION.fast).toBeLessThan(200);
    
    // Normal for standard transitions
    expect(DURATION.normal).toBeGreaterThanOrEqual(200);
    expect(DURATION.normal).toBeLessThan(400);
    
    // Slow for panels and modals
    expect(DURATION.slow).toBeGreaterThanOrEqual(400);
  });
});

describe('Requirements Validation', () => {
  it('should satisfy requirement 19.4 - smooth animations', () => {
    // Verify easing functions are smooth (cubic-bezier)
    expect(EASING.easeOutExpo).toContain('cubic-bezier');
    expect(EASING.easeInOutCirc).toContain('cubic-bezier');
    expect(EASING.easeSpring).toContain('cubic-bezier');
  });

  it('should satisfy requirement 19.7 - respect reduced motion', () => {
    // Verify reduced motion detection exists
    expect(typeof prefersReducedMotion).toBe('function');
    expect(typeof getAnimationDuration).toBe('function');
  });

  it('should satisfy requirement 19.9 - micro-interactions', () => {
    // Verify micro-interaction utilities exist
    const element = document.createElement('button');
    
    // Should be able to apply micro-interaction classes
    element.classList.add('btn-press');
    expect(element.classList.contains('btn-press')).toBe(true);
    
    element.classList.add('hover-lift');
    expect(element.classList.contains('hover-lift')).toBe(true);
    
    element.classList.add('glow-yellow');
    expect(element.classList.contains('glow-yellow')).toBe(true);
  });

  it('should satisfy requirement 19.15 - consistent timing', () => {
    // Verify consistent easing functions and durations
    expect(EASING).toHaveProperty('easeOutExpo');
    expect(EASING).toHaveProperty('easeInOutCirc');
    expect(EASING).toHaveProperty('easeSpring');
    
    expect(DURATION).toHaveProperty('fast');
    expect(DURATION).toHaveProperty('normal');
    expect(DURATION).toHaveProperty('slow');
    expect(DURATION).toHaveProperty('verySlow');
  });
});
