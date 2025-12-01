import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MapRenderer,
  ChartRenderer,
  ImageRenderer,
  VideoRenderer,
  IframeRenderer,
  SearchResultsRenderer,
} from './renderers';
import { aiOutputSyncService } from '../services/AIOutputSyncService';
import type { SyncMessage } from '../services/AIOutputSyncService';
import AIOutputSkeleton from './skeletons/AIOutputSkeleton';
import AILoadingIndicator from './AILoadingIndicator';
import MultimodalAIResponse from './MultimodalAIResponse';
import { aiContentBroadcaster, type MultimodalAIContent } from '../services/AIContentBroadcaster';
import { getTypographyClasses } from '../utils/designSystem';
import { AIOutputHistoryManager } from '../services/AIOutputHistoryManager';
import type { AIOutputEntry } from '../types/ai.types';
import AICard, { AICardHeader, AICardTitle, AICardDescription, AICardContent } from './AICard';
import { aiAnimationController } from '../utils/AIAnimationController';

// ============================================================================
// Type Definitions
// ============================================================================

export interface AIOutputContent {
  id: string;
  type: 'map' | 'chart' | 'image' | 'video' | 'iframe' | 'search-results' | 'custom';
  data: any;
  metadata: {
    title?: string;
    description?: string;
    timestamp: Date;
    generatedBy: 'ai' | 'tutor';
  };
  interactionState?: {
    zoom?: number;
    pan?: { x: number; y: number };
    selectedElements?: string[];
  };
}

interface AIOutputPanelProps {
  sessionId: string;
  role: 'tutor' | 'tutee';
}

// ============================================================================
// Empty State Component
// ============================================================================

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-[#FFEE32]/20 to-[#FFD500]/20 rounded-full flex items-center justify-center mb-4 shadow-md">
        <svg 
          className="w-10 h-10 text-[#FDC500]" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No AI Output Yet
      </h3>
      <p className="text-sm text-gray-500 max-w-sm">
        Ask the AI assistant to generate visualizations, maps, or other content to see them here.
      </p>
    </div>
  );
}

// Loading skeleton is now imported from separate component

// ============================================================================
// History Entry Component
// ============================================================================

interface HistoryEntryProps {
  entry: AIOutputEntry;
  showDebugInfo: boolean;
  isNewest?: boolean;
}

function HistoryEntry({ entry, showDebugInfo, isNewest }: HistoryEntryProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Apply animations to new entries
  useEffect(() => {
    if (isNewest && cardRef.current) {
      const animateEntry = async () => {
        // First, fade in the card
        await aiAnimationController.fadeInImage(cardRef.current!, { duration: 400 });
        
        // Then apply staggered animations to content elements if available
        if (contentRef.current) {
          const elements = Array.from(contentRef.current.querySelectorAll('.animate-stagger-item')) as HTMLElement[];
          if (elements.length > 0) {
            await aiAnimationController.staggerElements(elements, {
              staggerDelay: 75,
              duration: 300,
            });
          }
        }
      };
      
      animateEntry();
    }
  }, [isNewest]);
  
  // Format timestamp
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };
  
  return (
    <div ref={cardRef} style={{ opacity: isNewest ? 0 : 1 }}>
      <AICard variant="base" className="mb-4">
        <AICardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <AICardTitle className="text-sm font-medium text-gray-700 mb-1">
                {entry.userQuery}
              </AICardTitle>
              <AICardDescription className="text-xs text-gray-500">
                {formatTimestamp(entry.timestamp)}
              </AICardDescription>
            </div>
            {showDebugInfo && entry.processingTime && (
              <span className="text-xs text-gray-400 ml-2">
                {entry.processingTime}ms
              </span>
            )}
          </div>
        </AICardHeader>
        
        <div ref={contentRef}>
          <AICardContent>
            <MultimodalAIResponse
              textResponse={entry.textResponse}
              images={entry.images}
              searchResults={entry.searchResults}
              cost={undefined}
              processingTime={entry.processingTime}
              imageSource={entry.images.length > 0 ? 'unsplash' : 'none'}
              showDebugInfo={false}
            />
          </AICardContent>
        </div>
      </AICard>
    </div>
  );
}

// ============================================================================
// Main AIOutputPanel Component
// ============================================================================

export default function AIOutputPanel({ sessionId, role }: AIOutputPanelProps) {
  const [content, setContent] = useState<AIOutputContent | null>(null);
  const [multimodalContent, setMultimodalContent] = useState<MultimodalAIContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSynced, setIsSynced] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const interactionUpdateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // History management
  const historyManagerRef = useRef<AIOutputHistoryManager | null>(null);
  const [history, setHistory] = useState<AIOutputEntry[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const previousHistoryLengthRef = useRef(0);

  // Handle content updates from WebSocket
  const handleContentUpdate = useCallback((message: SyncMessage) => {
    if (message.type === 'content-update' && message.data?.content) {
      console.log('Received content update:', message.data.content);
      setContent(message.data.content);
      setIsLoading(false);
      setError(null);
    }
  }, []);

  // Handle interaction updates from WebSocket (for synced tutees)
  const handleInteractionUpdate = useCallback((message: SyncMessage) => {
    if (message.type === 'interaction-update' && message.data && isSynced && role === 'tutee') {
      console.log('Received interaction update:', message.data);
      
      // Update content interaction state
      setContent(prevContent => {
        if (!prevContent || prevContent.id !== message.data.contentId) {
          return prevContent;
        }
        
        return {
          ...prevContent,
          interactionState: {
            ...prevContent.interactionState,
            ...message.data.interactionState,
          },
        };
      });
    }
  }, [isSynced, role]);

  // Handle sync response (initial state)
  const handleSyncResponse = useCallback((message: SyncMessage) => {
    if (message.type === 'sync-response' && message.data) {
      console.log('Received sync response:', message.data);
      
      if (message.data.content) {
        setContent(message.data.content);
      }
      
      setIsLoading(false);
    }
  }, []);

  // Handle error messages
  const handleError = useCallback((message: SyncMessage) => {
    if (message.type === 'error' && message.data?.message) {
      console.error('Sync error:', message.data.message);
      setError(message.data.message);
      setIsLoading(false);
    }
  }, []);

  // Initialize history manager
  useEffect(() => {
    if (!historyManagerRef.current) {
      historyManagerRef.current = new AIOutputHistoryManager({
        maxEntries: 50,
        persistToSession: true,
        autoScroll: true,
      });
      
      // Load existing history
      const existingHistory = historyManagerRef.current.getHistory();
      setHistory(existingHistory);
      previousHistoryLengthRef.current = existingHistory.length;
    }
    
    // Clear history on session end
    return () => {
      if (historyManagerRef.current) {
        historyManagerRef.current.clearHistory();
      }
    };
  }, []);
  
  // Auto-scroll to top when new entry is added
  useEffect(() => {
    if (history.length > previousHistoryLengthRef.current && scrollContainerRef.current) {
      // New entry added, scroll to top
      if (historyManagerRef.current?.shouldAutoScroll()) {
        const container = scrollContainerRef.current;
        // Smooth scroll to top
        container.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }
    }
    previousHistoryLengthRef.current = history.length;
  }, [history]);

  // Subscribe to loading state
  useEffect(() => {
    console.log('🎧 AIOutputPanel subscribing to loading state');
    const unsubscribe = aiContentBroadcaster.subscribeToLoading((loading) => {
      console.log('⏳ AIOutputPanel loading state changed:', loading);
      setIsLoading(loading);
    });

    return () => {
      console.log('🔌 AIOutputPanel unsubscribing from loading state');
      unsubscribe();
    };
  }, []);

  // Subscribe to multimodal AI content
  useEffect(() => {
    console.log('🎧 AIOutputPanel subscribing to content broadcaster');
    const unsubscribe = aiContentBroadcaster.subscribe((content) => {
      console.log('📥 AIOutputPanel received multimodal content:', {
        hasText: !!content.textResponse,
        imageCount: content.images.length,
        searchResultCount: content.searchResults.length,
      });
      setMultimodalContent(content);
      
      // Add to history
      if (historyManagerRef.current && content.textResponse) {
        const entry: AIOutputEntry = {
          id: `entry-${Date.now()}`,
          timestamp: new Date(),
          userQuery: content.userQuery || 'User query',
          textResponse: content.textResponse,
          images: content.images,
          searchResults: content.searchResults,
          processingTime: content.processingTime || 0,
        };
        
        historyManagerRef.current.addEntry(entry);
        setHistory(historyManagerRef.current.getHistory());
      }
    });

    // Get latest content if available
    const latest = aiContentBroadcaster.getLatestContent();
    if (latest) {
      console.log('📦 AIOutputPanel loading cached content');
      setMultimodalContent(latest);
    }

    return () => {
      console.log('🔌 AIOutputPanel unsubscribing from content broadcaster');
      unsubscribe();
    };
  }, []);

  // Initialize WebSocket connection (for legacy content)
  useEffect(() => {
    console.log('AIOutputPanel initialized for session:', sessionId);
    
    // Connect to WebSocket (for legacy sync features, not required for AI output)
    aiOutputSyncService.connect(
      sessionId,
      `user-${Date.now()}`, // In production, use actual user ID
      (connected) => {
        // Connection status is not critical for AI output functionality
        // AI content is delivered via aiContentBroadcaster
        if (!connected) {
          console.log('WebSocket sync service not connected (this is optional)');
        }
      }
    );

    // Register message handlers
    aiOutputSyncService.on('content-update', handleContentUpdate);
    aiOutputSyncService.on('interaction-update', handleInteractionUpdate);
    aiOutputSyncService.on('sync-response', handleSyncResponse);
    aiOutputSyncService.on('error', handleError);

    // Cleanup on unmount
    return () => {
      aiOutputSyncService.off('content-update', handleContentUpdate);
      aiOutputSyncService.off('interaction-update', handleInteractionUpdate);
      aiOutputSyncService.off('sync-response', handleSyncResponse);
      aiOutputSyncService.off('error', handleError);
      aiOutputSyncService.disconnect();
      
      if (interactionUpdateTimeoutRef.current) {
        clearTimeout(interactionUpdateTimeoutRef.current);
      }
    };
  }, [sessionId, handleContentUpdate, handleInteractionUpdate, handleSyncResponse, handleError]);

  // Broadcast interaction updates when tutor interacts (debounced)
  // This function will be called by content renderers when tutor interacts with content
  // Currently prepared for future integration with interactive content renderers
  const broadcastInteraction = useCallback((interactionState: any) => {
    if (role !== 'tutor' || !content) return;

    // Clear existing timeout
    if (interactionUpdateTimeoutRef.current) {
      clearTimeout(interactionUpdateTimeoutRef.current);
    }

    // Debounce interaction updates (100ms)
    interactionUpdateTimeoutRef.current = setTimeout(() => {
      aiOutputSyncService.broadcastInteractionUpdate(content.id, interactionState);
    }, 100);
  }, [role, content]);

  // Log function availability for debugging
  if (role === 'tutor' && content) {
    console.debug('Interaction broadcast available for content:', content.id, broadcastInteraction);
  }

  // Render content based on state with fade transitions
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="h-full flex items-center justify-center">
          <AILoadingIndicator 
            size="large" 
            message="AI is generating your response..." 
          />
        </div>
      );
    }

    // Display history if available
    if (history.length > 0) {
      return (
        <div className="h-full overflow-auto p-6" ref={scrollContainerRef}>
          <div className="space-y-4">
            {history.map((entry, index) => (
              <HistoryEntry
                key={entry.id}
                entry={entry}
                showDebugInfo={showDebugInfo}
                isNewest={index === 0}
              />
            ))}
          </div>
        </div>
      );
    }

    // Fallback to legacy content display
    if (!content) {
      return <EmptyState />;
    }

    // Render appropriate content type with fade-in animation
    const contentElement = (() => {
      switch (content.type) {
        case 'map':
          return <MapRenderer data={content.data} interactionState={content.interactionState} />;
        case 'chart':
          return <ChartRenderer data={content.data} />;
        case 'image':
          return <ImageRenderer src={content.data.url} alt={content.data.alt} title={content.data.title} />;
        case 'video':
          return <VideoRenderer src={content.data.url} title={content.data.title} autoplay={content.data.autoplay} />;
        case 'iframe':
          return <IframeRenderer src={content.data.url} title={content.data.title} allowFullscreen={content.data.allowFullscreen} />;
        case 'search-results':
          return <SearchResultsRenderer results={content.data.results} query={content.data.query} />;
        case 'custom':
          return (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">Custom Content</p>
                <p className="text-xs text-gray-500">Custom renderer not yet implemented</p>
              </div>
            </div>
          );
        default:
          return (
            <div className="h-full flex items-center justify-center p-8">
              <p className="text-gray-500">Unknown content type: {content.type}</p>
            </div>
          );
      }
    })();

    return (
      <div className="h-full animate-fade-in">
        {contentElement}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white" role="region" aria-label="AI Output Panel">
      {/* Header */}
      <header className="px-6 py-4 border-b border-[#FFD500]/20 flex items-center justify-between bg-gradient-to-r from-[#FFEE32]/5 to-white">
        <div className="flex-1 flex items-center gap-3">
          <div className="flex-1">
            <h3 className={`${getTypographyClasses('base', 'semibold')} text-gray-900`} id="ai-output-title">
              {multimodalContent ? 'AI Response' : (content?.metadata.title || 'AI Output')}
            </h3>
            {multimodalContent && multimodalContent.processingTime && (
              <p className={`${getTypographyClasses('xs', 'normal')} text-gray-500 mt-1`} id="ai-output-description">
                Processed in {multimodalContent.processingTime}ms
              </p>
            )}
            {!multimodalContent && content?.metadata.description && (
              <p className={`${getTypographyClasses('xs', 'normal')} text-gray-500 mt-1`} id="ai-output-description">
                {content.metadata.description}
              </p>
            )}
          </div>
          
          {/* Debug toggle */}
          {multimodalContent && multimodalContent.cost && (
            <button
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="p-1.5 rounded hover:bg-[#FFEE32]/30 transition-all duration-200"
              title={showDebugInfo ? 'Hide debug info' : 'Show debug info'}
            >
              <svg className="w-4 h-4 text-[#FDC500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Sync toggle for tutees */}
        {role === 'tutee' && (
          <button
            onClick={() => setIsSynced(!isSynced)}
            className={`ml-3 px-3 py-2 rounded-lg ${getTypographyClasses('xs', 'medium')} transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm hover:shadow-md ${
              isSynced
                ? 'bg-[#FDC500] text-gray-900 hover:bg-[#FFD500] focus:ring-[#FDC500]'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400'
            }`}
            aria-label={isSynced ? 'Currently synced with tutor. Click to enable free exploration' : 'Currently in free exploration mode. Click to sync with tutor'}
            aria-pressed={isSynced}
          >
            {isSynced ? (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Synced
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                Free Explore
              </span>
            )}
          </button>
        )}
      </header>
      
      {/* Error banner */}
      {error && (
        <div 
          className="px-4 py-2 bg-yellow-50 border-b border-yellow-200 flex items-center gap-2"
          role="alert"
          aria-live="assertive"
        >
          <svg className="w-4 h-4 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs text-yellow-800">{error}</p>
        </div>
      )}
      
      {/* Content Area */}
      <div 
        className="flex-1 overflow-auto"
        role="main"
        aria-labelledby="ai-output-title"
        aria-describedby={content?.metadata.description ? "ai-output-description" : undefined}
      >
        {renderContent()}
      </div>
    </div>
  );
}
