import { useEffect, useRef } from 'react';
import { trapFocus, restoreFocus } from '../utils/accessibility';

/**
 * Custom hook to trap focus within a container element
 * Useful for modals, dialogs, and other overlay components
 * 
 * @param isActive - Whether the focus trap should be active
 * @returns Ref to attach to the container element
 */
export function useFocusTrap<T extends HTMLElement>(isActive: boolean = true) {
  const containerRef = useRef<T>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store the currently focused element
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    // Set up focus trap
    const cleanup = trapFocus(containerRef.current);

    // Cleanup function
    return () => {
      cleanup();
      // Restore focus to previously focused element
      restoreFocus(previouslyFocusedElement.current);
    };
  }, [isActive]);

  return containerRef;
}
