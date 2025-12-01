/**
 * AIAnimationController
 * 
 * Coordinates smooth, modern animations for AI features with accessibility support.
 * Respects user's prefers-reduced-motion setting.
 */

export interface AnimationConfig {
  duration?: number;
  easing?: string;
  delay?: number;
  respectReducedMotion?: boolean;
}

export interface TypewriterConfig extends AnimationConfig {
  speed?: number; // characters per second
  cursor?: boolean;
}

export interface StaggerConfig extends AnimationConfig {
  staggerDelay?: number;
}

export class AIAnimationController {
  private defaultConfig: AnimationConfig = {
    duration: 300,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    delay: 0,
    respectReducedMotion: true,
  };

  /**
   * Check if animations should be applied based on user preferences
   */
  shouldAnimate(): boolean {
    if (typeof window === 'undefined') return false;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    return !mediaQuery.matches;
  }

  /**
   * Get default animation configuration
   */
  getDefaultConfig(): AnimationConfig {
    return { ...this.defaultConfig };
  }

  /**
   * Slide in panel from the right with smooth easing
   */
  async slideInPanel(
    element: HTMLElement,
    config?: AnimationConfig
  ): Promise<void> {
    const finalConfig = { ...this.defaultConfig, duration: 500, ...config };

    if (finalConfig.respectReducedMotion && !this.shouldAnimate()) {
      // Instant transition for reduced motion
      element.style.transform = 'translateX(0)';
      element.style.opacity = '1';
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      // Set initial state
      element.style.transform = 'translateX(100%)';
      element.style.opacity = '0';
      element.style.transition = `transform ${finalConfig.duration}ms ${finalConfig.easing}, opacity ${finalConfig.duration}ms ${finalConfig.easing}`;

      // Trigger animation after a frame
      requestAnimationFrame(() => {
        setTimeout(() => {
          element.style.transform = 'translateX(0)';
          element.style.opacity = '1';

          // Resolve after animation completes
          setTimeout(() => {
            resolve();
          }, finalConfig.duration!);
        }, finalConfig.delay);
      });
    });
  }

  /**
   * Slide out panel to the right
   */
  async slideOutPanel(
    element: HTMLElement,
    config?: AnimationConfig
  ): Promise<void> {
    const finalConfig = { ...this.defaultConfig, duration: 500, ...config };

    if (finalConfig.respectReducedMotion && !this.shouldAnimate()) {
      // Instant transition for reduced motion
      element.style.transform = 'translateX(100%)';
      element.style.opacity = '0';
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      element.style.transition = `transform ${finalConfig.duration}ms ${finalConfig.easing}, opacity ${finalConfig.duration}ms ${finalConfig.easing}`;

      setTimeout(() => {
        element.style.transform = 'translateX(100%)';
        element.style.opacity = '0';

        // Resolve after animation completes
        setTimeout(() => {
          resolve();
        }, finalConfig.duration!);
      }, finalConfig.delay);
    });
  }

  /**
   * Typewriter effect - reveal text character by character
   */
  async typewriterEffect(
    element: HTMLElement,
    text: string,
    config?: TypewriterConfig
  ): Promise<void> {
    const finalConfig = {
      ...this.defaultConfig,
      speed: 40, // 40 characters per second
      cursor: false,
      ...config,
    };

    if (finalConfig.respectReducedMotion && !this.shouldAnimate()) {
      // Instant display for reduced motion
      element.textContent = text;
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const chars = text.split('');
      let currentIndex = 0;
      const msPerChar = 1000 / finalConfig.speed!;

      // Clear element
      element.textContent = '';

      // Add cursor if enabled
      if (finalConfig.cursor) {
        const cursor = document.createElement('span');
        cursor.className = 'typewriter-cursor';
        cursor.textContent = '|';
        cursor.style.animation = 'blink 1s step-end infinite';
        element.appendChild(cursor);
      }

      const typeNextChar = () => {
        if (currentIndex < chars.length) {
          const textNode = element.childNodes[0] as Text;
          if (textNode && textNode.nodeType === Node.TEXT_NODE) {
            textNode.textContent += chars[currentIndex];
          } else {
            element.insertBefore(
              document.createTextNode(chars[currentIndex]),
              element.firstChild
            );
          }
          currentIndex++;

          // Use requestAnimationFrame for smooth animation
          setTimeout(() => {
            requestAnimationFrame(typeNextChar);
          }, msPerChar);
        } else {
          // Remove cursor when done
          if (finalConfig.cursor) {
            const cursor = element.querySelector('.typewriter-cursor');
            if (cursor) cursor.remove();
          }
          resolve();
        }
      };

      setTimeout(() => {
        requestAnimationFrame(typeNextChar);
      }, finalConfig.delay);
    });
  }

  /**
   * Fade in image with subtle scale effect
   */
  async fadeInImage(
    element: HTMLElement,
    config?: AnimationConfig
  ): Promise<void> {
    const finalConfig = { ...this.defaultConfig, duration: 400, ...config };

    if (finalConfig.respectReducedMotion && !this.shouldAnimate()) {
      // Instant display for reduced motion
      element.style.opacity = '1';
      element.style.transform = 'scale(1)';
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      // Set initial state
      element.style.opacity = '0';
      element.style.transform = 'scale(0.95)';
      element.style.transition = `opacity ${finalConfig.duration}ms ${finalConfig.easing}, transform ${finalConfig.duration}ms ${finalConfig.easing}`;

      // Trigger animation after a frame
      requestAnimationFrame(() => {
        setTimeout(() => {
          element.style.opacity = '1';
          element.style.transform = 'scale(1)';

          // Resolve after animation completes
          setTimeout(() => {
            resolve();
          }, finalConfig.duration!);
        }, finalConfig.delay);
      });
    });
  }

  /**
   * Stagger animations for multiple elements
   */
  async staggerElements(
    elements: HTMLElement[],
    config?: StaggerConfig
  ): Promise<void> {
    const finalConfig = {
      ...this.defaultConfig,
      staggerDelay: 75, // 75ms between elements
      ...config,
    };

    if (finalConfig.respectReducedMotion && !this.shouldAnimate()) {
      // Instant display for reduced motion
      elements.forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const promises = elements.map((element, index) => {
        return new Promise<void>((resolveElement) => {
          const delay = finalConfig.delay! + index * finalConfig.staggerDelay!;

          // Set initial state
          element.style.opacity = '0';
          element.style.transform = 'translateY(10px)';
          element.style.transition = `opacity ${finalConfig.duration}ms ${finalConfig.easing}, transform ${finalConfig.duration}ms ${finalConfig.easing}`;

          // Trigger animation
          setTimeout(() => {
            requestAnimationFrame(() => {
              element.style.opacity = '1';
              element.style.transform = 'translateY(0)';

              setTimeout(() => {
                resolveElement();
              }, finalConfig.duration!);
            });
          }, delay);
        });
      });

      Promise.all(promises).then(() => resolve());
    });
  }

  /**
   * Show loading indicator
   */
  showLoadingIndicator(
    container: HTMLElement,
    type: 'spinner' | 'dots' | 'pulse' = 'spinner'
  ): void {
    // Remove any existing loading indicator
    this.hideLoadingIndicator(container);

    const loader = document.createElement('div');
    loader.className = `ai-loading-indicator ai-loading-${type}`;
    loader.setAttribute('data-loading-indicator', 'true');

    if (type === 'spinner') {
      loader.innerHTML = `
        <div class="spinner">
          <div class="spinner-circle"></div>
        </div>
      `;
    } else if (type === 'dots') {
      loader.innerHTML = `
        <div class="dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      `;
    } else if (type === 'pulse') {
      loader.innerHTML = `
        <div class="pulse">
          <div class="pulse-circle"></div>
        </div>
      `;
    }

    container.appendChild(loader);
  }

  /**
   * Hide loading indicator
   */
  hideLoadingIndicator(container: HTMLElement): void {
    const loader = container.querySelector('[data-loading-indicator="true"]');
    if (loader) {
      loader.remove();
    }
  }
}

// Export singleton instance
export const aiAnimationController = new AIAnimationController();
