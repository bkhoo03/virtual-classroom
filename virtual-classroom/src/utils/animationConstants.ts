/**
 * Animation Constants
 * 
 * Centralized animation tokens for consistent motion design across the application.
 * Includes easing functions, durations, and delays for micro-interactions.
 */

// ============================================================================
// Easing Functions
// ============================================================================

/**
 * Easing function constants for smooth, natural animations
 */
export const EASING = {
  /**
   * Exponential ease-out - Strong deceleration, great for entrances
   * Creates a dramatic, attention-grabbing effect
   */
  easeOutExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
  
  /**
   * Circular ease-in-out - Smooth acceleration and deceleration
   * Perfect for continuous motion and transitions
   */
  easeInOutCirc: 'cubic-bezier(0.85, 0, 0.15, 1)',
  
  /**
   * Spring-like easing - Slight overshoot for playful interactions
   * Adds personality to micro-interactions
   */
  easeSpring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  
  /**
   * Standard ease-out - Natural deceleration
   * Default for most UI transitions
   */
  easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
  
  /**
   * Standard ease-in - Natural acceleration
   * Used for exit animations
   */
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  
  /**
   * Standard ease-in-out - Balanced acceleration and deceleration
   * Good for reversible animations
   */
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  
  /**
   * Emphasized ease - Strong acceleration, smooth deceleration
   * For important state changes
   */
  emphasized: 'cubic-bezier(0.0, 0, 0.2, 1)',
  
  /**
   * Bounce ease - Playful bounce effect
   * For success states and celebrations
   */
  easeBounce: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
} as const;

// ============================================================================
// Duration Constants
// ============================================================================

/**
 * Animation duration constants in milliseconds
 */
export const DURATION = {
  /**
   * Fast - 150ms
   * Quick micro-interactions (hover, focus)
   */
  fast: 150,
  
  /**
   * Normal - 300ms
   * Standard UI transitions (most common)
   */
  normal: 300,
  
  /**
   * Slow - 500ms
   * Panel slides, modal entrances
   */
  slow: 500,
  
  /**
   * Very Slow - 700ms
   * Page transitions, complex animations
   */
  verySlow: 700,
  
  /**
   * Instant - 0ms
   * For reduced motion preference
   */
  instant: 0,
  
  /**
   * Quick - 200ms
   * Slightly faster than normal
   */
  quick: 200,
  
  /**
   * Image fade - 400ms
   * Optimal for image loading animations
   */
  image: 400,
  
  /**
   * Panel - 500ms
   * Slide-in/slide-out panels
   */
  panel: 500,
} as const;

// ============================================================================
// Delay Constants
// ============================================================================

/**
 * Animation delay constants in milliseconds
 */
export const DELAY = {
  /**
   * Stagger - 75ms
   * Delay between staggered elements (50-100ms range)
   */
  stagger: 75,
  
  /**
   * Sequence - 150ms
   * Delay between sequential animations
   */
  sequence: 150,
  
  /**
   * Short - 50ms
   * Minimal delay for tight sequences
   */
  short: 50,
  
  /**
   * Medium - 100ms
   * Standard delay for cascading effects
   */
  medium: 100,
  
  /**
   * Long - 200ms
   * Longer delay for dramatic reveals
   */
  long: 200,
  
  /**
   * None - 0ms
   * No delay
   */
  none: 0,
} as const;

// ============================================================================
// CSS Variable Exports
// ============================================================================

/**
 * CSS custom properties for easing functions
 * Can be used directly in CSS/Tailwind
 */
export const EASING_CSS_VARS = {
  '--ease-out-expo': EASING.easeOutExpo,
  '--ease-in-out-circ': EASING.easeInOutCirc,
  '--ease-spring': EASING.easeSpring,
  '--ease-out': EASING.easeOut,
  '--ease-in': EASING.easeIn,
  '--ease-in-out': EASING.easeInOut,
  '--ease-emphasized': EASING.emphasized,
  '--ease-bounce': EASING.easeBounce,
} as const;

/**
 * CSS custom properties for durations
 */
export const DURATION_CSS_VARS = {
  '--duration-fast': `${DURATION.fast}ms`,
  '--duration-normal': `${DURATION.normal}ms`,
  '--duration-slow': `${DURATION.slow}ms`,
  '--duration-very-slow': `${DURATION.verySlow}ms`,
  '--duration-quick': `${DURATION.quick}ms`,
  '--duration-image': `${DURATION.image}ms`,
  '--duration-panel': `${DURATION.panel}ms`,
} as const;

/**
 * CSS custom properties for delays
 */
export const DELAY_CSS_VARS = {
  '--delay-stagger': `${DELAY.stagger}ms`,
  '--delay-sequence': `${DELAY.sequence}ms`,
  '--delay-short': `${DELAY.short}ms`,
  '--delay-medium': `${DELAY.medium}ms`,
  '--delay-long': `${DELAY.long}ms`,
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate CSS transition string
 * @param property - CSS property or array of properties to transition
 * @param duration - Duration in milliseconds (default: DURATION.normal)
 * @param easing - Easing function (default: EASING.easeOut)
 * @param delay - Delay in milliseconds (default: 0)
 */
export function createTransition(
  property: string | string[],
  duration: number = DURATION.normal,
  easing: string = EASING.easeOut,
  delay: number = 0
): string {
  const properties = Array.isArray(property) ? property : [property];
  return properties
    .map(prop => `${prop} ${duration}ms ${easing}${delay > 0 ? ` ${delay}ms` : ''}`)
    .join(', ');
}

/**
 * Calculate staggered delay for an element at a given index
 * @param index - Element index in the sequence
 * @param baseDelay - Base stagger delay (default: DELAY.stagger)
 */
export function getStaggerDelay(index: number, baseDelay: number = DELAY.stagger): number {
  return index * baseDelay;
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get animation duration respecting user's motion preference
 * @param duration - Desired duration in milliseconds
 * @returns Duration (0 if reduced motion is preferred)
 */
export function getAnimationDuration(duration: number): number {
  return prefersReducedMotion() ? DURATION.instant : duration;
}

/**
 * Get animation easing respecting user's motion preference
 * @param easing - Desired easing function
 * @returns Easing function (linear if reduced motion is preferred)
 */
export function getAnimationEasing(easing: string): string {
  return prefersReducedMotion() ? 'linear' : easing;
}

/**
 * Apply CSS variables to document root
 * Call this once during app initialization
 */
export function applyAnimationCSSVars(): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // Apply easing variables
  Object.entries(EASING_CSS_VARS).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  
  // Apply duration variables
  Object.entries(DURATION_CSS_VARS).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  
  // Apply delay variables
  Object.entries(DELAY_CSS_VARS).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

// ============================================================================
// Animation Presets
// ============================================================================

/**
 * Pre-configured animation presets for common use cases
 */
export const ANIMATION_PRESETS = {
  /**
   * Button press - Quick scale down
   */
  buttonPress: {
    duration: DURATION.fast,
    easing: EASING.easeOut,
    transform: 'scale(0.95)',
  },
  
  /**
   * Hover lift - Subtle elevation
   */
  hoverLift: {
    duration: DURATION.normal,
    easing: EASING.easeOutExpo,
    transform: 'translateY(-2px)',
  },
  
  /**
   * Yellow glow - Brand color glow effect
   */
  glowYellow: {
    duration: DURATION.normal,
    easing: EASING.easeOut,
    boxShadow: '0 0 20px rgba(253, 197, 0, 0.6)',
  },
  
  /**
   * Purple glow - Accent color glow effect
   */
  glowPurple: {
    duration: DURATION.normal,
    easing: EASING.easeOut,
    boxShadow: '0 0 20px rgba(92, 0, 153, 0.6)',
  },
  
  /**
   * Fade in - Standard fade entrance
   */
  fadeIn: {
    duration: DURATION.normal,
    easing: EASING.easeOut,
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  
  /**
   * Slide in from right - Panel entrance
   */
  slideInRight: {
    duration: DURATION.slow,
    easing: EASING.easeOutExpo,
    from: { transform: 'translateX(100%)' },
    to: { transform: 'translateX(0)' },
  },
  
  /**
   * Scale and fade - Image loading
   */
  scaleAndFade: {
    duration: DURATION.image,
    easing: EASING.easeOut,
    from: { opacity: 0, transform: 'scale(0.95)' },
    to: { opacity: 1, transform: 'scale(1)' },
  },
  
  /**
   * Bounce in - Playful entrance
   */
  bounceIn: {
    duration: DURATION.slow,
    easing: EASING.easeSpring,
    from: { opacity: 0, transform: 'scale(0.8)' },
    to: { opacity: 1, transform: 'scale(1)' },
  },
} as const;

// ============================================================================
// Type Exports
// ============================================================================

export type EasingKey = keyof typeof EASING;
export type DurationKey = keyof typeof DURATION;
export type DelayKey = keyof typeof DELAY;
export type AnimationPresetKey = keyof typeof ANIMATION_PRESETS;
