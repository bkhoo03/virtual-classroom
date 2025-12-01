import type { SearchResult, UnsplashImage, GeneratedImage } from '../types/ai.types';

/**
 * Multimodal AI content that can be displayed in the AI Output Panel
 */
export interface MultimodalAIContent {
  id: string;
  userQuery?: string;
  textResponse: string;
  images: (UnsplashImage | GeneratedImage)[];
  searchResults: SearchResult[];
  timestamp: Date;
  cost?: {
    text: number;
    images: number;
    search: number;
    total: number;
  };
  processingTime?: number;
  imageSource?: 'unsplash' | 'dalle' | 'both' | 'none';
}

type ContentListener = (content: MultimodalAIContent) => void;
type LoadingListener = (isLoading: boolean) => void;

/**
 * Simple event broadcaster for AI content
 * Allows AIAssistant to send multimodal content to AIOutputPanel
 */
class AIContentBroadcaster {
  private listeners: Set<ContentListener> = new Set();
  private loadingListeners: Set<LoadingListener> = new Set();
  private latestContent: MultimodalAIContent | null = null;
  private isLoading: boolean = false;

  /**
   * Subscribe to content updates
   */
  subscribe(listener: ContentListener): () => void {
    this.listeners.add(listener);
    
    // Send latest content immediately if available
    if (this.latestContent) {
      listener(this.latestContent);
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Broadcast new content to all listeners
   */
  broadcast(content: MultimodalAIContent): void {
    this.latestContent = content;
    this.listeners.forEach(listener => {
      try {
        listener(content);
      } catch (error) {
        console.error('Error in content listener:', error);
      }
    });
  }

  /**
   * Get the latest content
   */
  getLatestContent(): MultimodalAIContent | null {
    return this.latestContent;
  }

  /**
   * Subscribe to loading state updates
   */
  subscribeToLoading(listener: LoadingListener): () => void {
    this.loadingListeners.add(listener);
    
    // Send current loading state immediately
    listener(this.isLoading);

    // Return unsubscribe function
    return () => {
      this.loadingListeners.delete(listener);
    };
  }

  /**
   * Set loading state and notify listeners
   */
  setLoading(loading: boolean): void {
    this.isLoading = loading;
    this.loadingListeners.forEach(listener => {
      try {
        listener(loading);
      } catch (error) {
        console.error('Error in loading listener:', error);
      }
    });
  }

  /**
   * Get current loading state
   */
  getLoadingState(): boolean {
    return this.isLoading;
  }

  /**
   * Clear all content
   */
  clear(): void {
    this.latestContent = null;
    this.isLoading = false;
    this.listeners.forEach(listener => {
      // Optionally notify listeners of clear
    });
  }
}

// Export singleton instance
export const aiContentBroadcaster = new AIContentBroadcaster();
