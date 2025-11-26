import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  action: () => void;
  description: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
}

export interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

/**
 * Custom hook for managing keyboard shortcuts
 * Handles keyboard events and executes corresponding actions
 */
export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Find matching shortcut
      const matchingShortcut = shortcuts.find((shortcut) => {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey;
        const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.altKey ? event.altKey : !event.altKey;

        return keyMatch && ctrlMatch && shiftMatch && altMatch;
      });

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.action();
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);

  return {
    shortcuts,
  };
}

/**
 * Get formatted keyboard shortcut display string
 */
export function getShortcutDisplay(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.shiftKey) parts.push('Shift');
  if (shortcut.altKey) parts.push('Alt');
  parts.push(shortcut.key.toUpperCase());

  return parts.join(' + ');
}
