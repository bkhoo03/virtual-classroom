/**
 * AIOutputHistoryManager
 * 
 * Manages AI response history with persistence and display.
 * Stores up to 50 entries in memory and persists to sessionStorage.
 */

import { AIOutputEntry, HistoryConfig } from '../types/ai.types';

const STORAGE_KEY = 'ai_output_history';
const DEFAULT_MAX_ENTRIES = 50;

export class AIOutputHistoryManager {
  private history: AIOutputEntry[] = [];
  private maxEntries: number;
  private persistToSession: boolean;
  private autoScroll: boolean;

  constructor(config: HistoryConfig = {}) {
    this.maxEntries = config.maxEntries ?? DEFAULT_MAX_ENTRIES;
    this.persistToSession = config.persistToSession ?? true;
    this.autoScroll = config.autoScroll ?? true;

    // Load history from sessionStorage on initialization
    if (this.persistToSession) {
      this.loadFromSessionStorage();
    }
  }

  /**
   * Add a new entry to the history
   * Maintains chronological order (newest first)
   * Limits to maxEntries
   */
  addEntry(entry: AIOutputEntry): void {
    // Add to beginning of array (newest first)
    this.history.unshift(entry);

    // Limit to maxEntries
    if (this.history.length > this.maxEntries) {
      this.history = this.history.slice(0, this.maxEntries);
    }

    // Persist to sessionStorage
    if (this.persistToSession) {
      this.persistToSessionStorage();
    }
  }

  /**
   * Get all history entries
   * Returns in chronological order (newest first)
   */
  getHistory(): AIOutputEntry[] {
    return [...this.history];
  }

  /**
   * Clear all history entries
   */
  clearHistory(): void {
    this.history = [];
    
    // Clear sessionStorage
    if (this.persistToSession) {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error('Failed to clear history from sessionStorage:', error);
      }
    }
  }

  /**
   * Persist history to sessionStorage
   */
  persistToSessionStorage(): void {
    try {
      const serialized = JSON.stringify(this.history, (key, value) => {
        // Convert Date objects to ISO strings
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value;
      });
      
      sessionStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('SessionStorage quota exceeded. Clearing old entries...');
        // Remove oldest entries and try again
        this.history = this.history.slice(0, Math.floor(this.maxEntries / 2));
        try {
          const serialized = JSON.stringify(this.history, (key, value) => {
            if (value instanceof Date) {
              return value.toISOString();
            }
            return value;
          });
          sessionStorage.setItem(STORAGE_KEY, serialized);
        } catch (retryError) {
          console.error('Failed to persist history after clearing old entries:', retryError);
        }
      } else {
        console.error('Failed to persist history to sessionStorage:', error);
      }
    }
  }

  /**
   * Load history from sessionStorage
   */
  loadFromSessionStorage(): AIOutputEntry[] {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored, (key, value) => {
          // Convert ISO strings back to Date objects
          if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
            return new Date(value);
          }
          return value;
        });
        
        // Validate and restore history
        if (Array.isArray(parsed)) {
          this.history = parsed.slice(0, this.maxEntries);
          return this.getHistory();
        }
      }
    } catch (error) {
      console.error('Failed to load history from sessionStorage:', error);
    }
    
    return [];
  }

  /**
   * Get a specific entry by ID
   */
  getEntryById(id: string): AIOutputEntry | null {
    return this.history.find(entry => entry.id === id) ?? null;
  }

  /**
   * Get the number of entries in history
   */
  getHistoryCount(): number {
    return this.history.length;
  }

  /**
   * Check if auto-scroll is enabled
   */
  shouldAutoScroll(): boolean {
    return this.autoScroll;
  }
}
