import { useCallback, useRef } from 'react';

export type FeedbackAnimationType = 'success-glow' | 'error-shake' | 'bounce' | 'pulse';

/**
 * Hook for triggering feedback animations on elements
 * Returns a function to trigger animations and a ref to attach to the element
 */
export function useFeedbackAnimation() {
  const elementRef = useRef<HTMLElement>(null);

  const triggerAnimation = useCallback((animationType: FeedbackAnimationType) => {
    const element = elementRef.current;
    if (!element) return;

    // Remove any existing animation classes
    element.classList.remove(
      'animate-success-glow',
      'animate-error-shake',
      'animate-bounce',
      'animate-pulse'
    );

    // Force reflow to restart animation
    void element.offsetWidth;

    // Add the animation class
    element.classList.add(`animate-${animationType}`);

    // Remove the animation class after it completes
    const duration = animationType === 'pulse' ? 2000 : animationType === 'success-glow' ? 600 : 500;
    setTimeout(() => {
      element.classList.remove(`animate-${animationType}`);
    }, duration);
  }, []);

  return { elementRef, triggerAnimation };
}

/**
 * Utility function to trigger feedback animation on any element
 */
export function triggerFeedbackAnimation(
  element: HTMLElement | null,
  animationType: FeedbackAnimationType
) {
  if (!element) return;

  // Remove any existing animation classes
  element.classList.remove(
    'animate-success-glow',
    'animate-error-shake',
    'animate-bounce',
    'animate-pulse'
  );

  // Force reflow to restart animation
  void element.offsetWidth;

  // Add the animation class
  element.classList.add(`animate-${animationType}`);

  // Remove the animation class after it completes
  const duration = animationType === 'pulse' ? 2000 : animationType === 'success-glow' ? 600 : 500;
  setTimeout(() => {
    element.classList.remove(`animate-${animationType}`);
  }, duration);
}
