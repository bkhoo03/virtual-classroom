import { useState, useEffect } from 'react';

export interface AccessibilityPreferences {
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
  prefersColorScheme: 'light' | 'dark' | 'no-preference';
}

/**
 * Custom hook to detect user accessibility preferences
 * Monitors system preferences for reduced motion, high contrast, and color scheme
 * 
 * @returns Current accessibility preferences
 */
export function useAccessibilityPreferences(): AccessibilityPreferences {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() => ({
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches,
    prefersColorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'no-preference',
  }));

  useEffect(() => {
    // Create media query lists
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const darkSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const lightSchemeQuery = window.matchMedia('(prefers-color-scheme: light)');

    // Handler for reduced motion changes
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setPreferences((prev) => ({
        ...prev,
        prefersReducedMotion: e.matches,
      }));
    };

    // Handler for high contrast changes
    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setPreferences((prev) => ({
        ...prev,
        prefersHighContrast: e.matches,
      }));
    };

    // Handler for color scheme changes
    const handleColorSchemeChange = () => {
      const isDark = darkSchemeQuery.matches;
      const isLight = lightSchemeQuery.matches;
      setPreferences((prev) => ({
        ...prev,
        prefersColorScheme: isDark ? 'dark' : isLight ? 'light' : 'no-preference',
      }));
    };

    // Add event listeners
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    highContrastQuery.addEventListener('change', handleHighContrastChange);
    darkSchemeQuery.addEventListener('change', handleColorSchemeChange);
    lightSchemeQuery.addEventListener('change', handleColorSchemeChange);

    // Cleanup
    return () => {
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
      darkSchemeQuery.removeEventListener('change', handleColorSchemeChange);
      lightSchemeQuery.removeEventListener('change', handleColorSchemeChange);
    };
  }, []);

  return preferences;
}

/**
 * Hook to check if reduced motion is preferred
 * @returns true if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  const { prefersReducedMotion } = useAccessibilityPreferences();
  return prefersReducedMotion;
}

/**
 * Hook to check if high contrast is preferred
 * @returns true if user prefers high contrast
 */
export function usePrefersHighContrast(): boolean {
  const { prefersHighContrast } = useAccessibilityPreferences();
  return prefersHighContrast;
}

/**
 * Get animation duration based on user preferences
 * Returns 0 if reduced motion is preferred, otherwise returns the specified duration
 * 
 * @param duration - The desired animation duration in milliseconds
 * @returns Adjusted duration based on user preferences
 */
export function useAnimationDuration(duration: number): number {
  const prefersReducedMotion = usePrefersReducedMotion();
  return prefersReducedMotion ? 0 : duration;
}
