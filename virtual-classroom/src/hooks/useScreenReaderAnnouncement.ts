import { useEffect, useRef } from 'react';
import { announceToScreenReader } from '../utils/accessibility';

/**
 * Custom hook to announce messages to screen readers
 * Prevents duplicate announcements for the same message
 * 
 * @param message - The message to announce
 * @param priority - The priority level ('polite' or 'assertive')
 * @param enabled - Whether announcements are enabled
 */
export function useScreenReaderAnnouncement(
  message: string | null,
  priority: 'polite' | 'assertive' = 'polite',
  enabled: boolean = true
) {
  const previousMessageRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !message || message === previousMessageRef.current) {
      return;
    }

    announceToScreenReader(message, priority);
    previousMessageRef.current = message;
  }, [message, priority, enabled]);
}

/**
 * Custom hook to announce state changes to screen readers
 * Useful for announcing connection status, video/audio state changes, etc.
 * 
 * @param state - The current state value
 * @param getMessage - Function to generate announcement message from state
 * @param priority - The priority level ('polite' or 'assertive')
 */
export function useStateChangeAnnouncement<T>(
  state: T,
  getMessage: (state: T) => string | null,
  priority: 'polite' | 'assertive' = 'polite'
) {
  const previousStateRef = useRef<T>(state);

  useEffect(() => {
    // Only announce if state actually changed
    if (state === previousStateRef.current) {
      return;
    }

    const message = getMessage(state);
    if (message) {
      announceToScreenReader(message, priority);
    }

    previousStateRef.current = state;
  }, [state, getMessage, priority]);
}
