/**
 * Design System Constants
 * 
 * Centralized design tokens for consistent styling across AI components
 */

// ============================================================================
// Timing Functions
// ============================================================================

export const TIMING_FUNCTIONS = {
  // Entrance animations (ease-out for natural deceleration)
  easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
  
  // Exit animations (ease-in for natural acceleration)
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  
  // Standard transitions
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Emphasized transitions
  emphasized: 'cubic-bezier(0.0, 0, 0.2, 1)',
  
  // Decelerated transitions
  decelerated: 'cubic-bezier(0.0, 0, 0.2, 1)',
  
  // Accelerated transitions
  accelerated: 'cubic-bezier(0.4, 0, 1, 1)',
} as const;

// ============================================================================
// Duration Constants
// ============================================================================

export const DURATIONS = {
  // Quick transitions (hover, focus)
  quick: 150,
  
  // Standard transitions (most UI changes)
  standard: 300,
  
  // Panel animations (slide-in, slide-out)
  panel: 500,
  
  // Image fade-in
  image: 400,
  
  // Typewriter character delay (ms per character)
  typewriterSpeed: 30, // 30-50ms per character for natural pacing
  
  // Stagger delay between elements
  stagger: 75, // 50-100ms between elements
} as const;

// ============================================================================
// Spacing Scale
// ============================================================================

export const SPACING = {
  // Base unit: 4px
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px
  '2xl': '2rem',   // 32px
  '3xl': '3rem',   // 48px
  '4xl': '4rem',   // 64px
} as const;

// ============================================================================
// Typography Scale
// ============================================================================

export const TYPOGRAPHY = {
  // Font sizes
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  
  // Font weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
  
  // Letter spacing
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },
} as const;

// ============================================================================
// Brand Colors
// ============================================================================

export const BRAND_COLORS = {
  // Primary yellows
  primaryYellow: '#FDC500',
  brightYellow: '#FFD500',
  lightYellow: '#FFEE32',
  
  // Accent purples
  deepPurple: '#5C0099',
  lightPurple: '#C86BFA',
  
  // Background
  darkNavy: '#03071E',
} as const;

// ============================================================================
// Shadow Scale
// ============================================================================

export const SHADOWS = {
  // Subtle elevation
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  
  // Card elevation
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  
  // Elevated card
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  
  // Modal/dialog
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  
  // Hover state
  hover: '0 10px 20px -5px rgba(0, 0, 0, 0.15), 0 4px 8px -2px rgba(0, 0, 0, 0.08)',
  
  // Brand color shadows
  yellowGlow: '0 4px 12px rgba(253, 197, 0, 0.3)',
  purpleGlow: '0 4px 12px rgba(92, 0, 153, 0.3)',
} as const;

// ============================================================================
// Border Radius Scale
// ============================================================================

export const BORDER_RADIUS = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const;

// ============================================================================
// Card Styles
// ============================================================================

export const CARD_STYLES = {
  // Base card style
  base: {
    borderRadius: BORDER_RADIUS.lg,
    boxShadow: SHADOWS.md,
    padding: SPACING.xl,
    backgroundColor: '#ffffff',
    transition: `all ${DURATIONS.standard}ms ${TIMING_FUNCTIONS.standard}`,
  },
  
  // Hover state
  hover: {
    boxShadow: SHADOWS.hover,
    transform: 'translateY(-2px)',
  },
  
  // Compact card
  compact: {
    borderRadius: BORDER_RADIUS.md,
    boxShadow: SHADOWS.sm,
    padding: SPACING.lg,
    backgroundColor: '#ffffff',
  },
  
  // Elevated card
  elevated: {
    borderRadius: BORDER_RADIUS.xl,
    boxShadow: SHADOWS.lg,
    padding: SPACING['2xl'],
    backgroundColor: '#ffffff',
  },
} as const;

// ============================================================================
// Animation Presets
// ============================================================================

export const ANIMATIONS = {
  // Fade in
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: DURATIONS.standard,
    timingFunction: TIMING_FUNCTIONS.easeOut,
  },
  
  // Slide in from right
  slideInRight: {
    from: { transform: 'translateX(100%)' },
    to: { transform: 'translateX(0)' },
    duration: DURATIONS.panel,
    timingFunction: TIMING_FUNCTIONS.easeOut,
  },
  
  // Slide out to right
  slideOutRight: {
    from: { transform: 'translateX(0)' },
    to: { transform: 'translateX(100%)' },
    duration: DURATIONS.panel,
    timingFunction: TIMING_FUNCTIONS.easeIn,
  },
  
  // Scale and fade in (for images)
  scaleAndFadeIn: {
    from: { opacity: 0, transform: 'scale(0.95)' },
    to: { opacity: 1, transform: 'scale(1)' },
    duration: DURATIONS.image,
    timingFunction: TIMING_FUNCTIONS.easeOut,
  },
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate CSS transition string
 */
export function createTransition(
  property: string | string[],
  duration: number = DURATIONS.standard,
  timingFunction: string = TIMING_FUNCTIONS.standard
): string {
  const properties = Array.isArray(property) ? property : [property];
  return properties
    .map(prop => `${prop} ${duration}ms ${timingFunction}`)
    .join(', ');
}

/**
 * Generate staggered animation delay
 */
export function getStaggerDelay(index: number, baseDelay: number = DURATIONS.stagger): number {
  return index * baseDelay;
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get animation duration (respects reduced motion preference)
 */
export function getAnimationDuration(duration: number): number {
  return prefersReducedMotion() ? 0 : duration;
}

/**
 * Apply card styles to an element
 */
export function applyCardStyles(
  element: HTMLElement,
  variant: keyof typeof CARD_STYLES = 'base'
): void {
  const styles = CARD_STYLES[variant];
  Object.assign(element.style, {
    borderRadius: styles.borderRadius,
    boxShadow: styles.boxShadow,
    padding: styles.padding,
    backgroundColor: styles.backgroundColor,
    transition: styles.transition,
  });
}

// ============================================================================
// CSS Class Generators
// ============================================================================

/**
 * Generate card CSS classes
 */
export function getCardClasses(variant: 'base' | 'compact' | 'elevated' = 'base'): string {
  const baseClasses = 'bg-white transition-all duration-300';
  
  const variantClasses = {
    base: 'rounded-lg shadow-md p-6 hover:shadow-lg hover:-translate-y-0.5',
    compact: 'rounded-md shadow-sm p-4',
    elevated: 'rounded-xl shadow-lg p-8',
  };
  
  return `${baseClasses} ${variantClasses[variant]}`;
}

/**
 * Generate typography CSS classes
 */
export function getTypographyClasses(
  size: keyof typeof TYPOGRAPHY.fontSize = 'base',
  weight: keyof typeof TYPOGRAPHY.fontWeight = 'normal'
): string {
  const sizeMap = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
  };
  
  const weightMap = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };
  
  return `${sizeMap[size]} ${weightMap[weight]}`;
}

/**
 * Generate button CSS classes with brand colors
 */
export function getButtonClasses(
  variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'primary',
  size: 'sm' | 'md' | 'lg' = 'md'
): string {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const variantClasses = {
    primary: `bg-[${BRAND_COLORS.primaryYellow}] text-gray-900 hover:bg-[${BRAND_COLORS.brightYellow}] focus:ring-[${BRAND_COLORS.primaryYellow}] shadow-md hover:shadow-lg hover:-translate-y-0.5`,
    secondary: `bg-[${BRAND_COLORS.deepPurple}] text-white hover:bg-[${BRAND_COLORS.lightPurple}] focus:ring-[${BRAND_COLORS.deepPurple}] shadow-md hover:shadow-lg hover:-translate-y-0.5`,
    ghost: 'bg-transparent text-gray-300 hover:bg-white/10 focus:ring-gray-400',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-md hover:shadow-lg',
  };
  
  return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`;
}

/**
 * Get brand color inline styles (for dynamic styling)
 */
export function getBrandColorStyles(color: keyof typeof BRAND_COLORS): { backgroundColor: string } {
  return {
    backgroundColor: BRAND_COLORS[color],
  };
}
