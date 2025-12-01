import { useState, useEffect, useCallback, useRef } from 'react';
import { Send, Sparkles, X, MessageCircle, ChevronDown } from 'lucide-react';
import AIService from '../services/AIService';
import type { AIMessage, AIError } from '../types/ai.types';
import { useToast } from '../contexts/ToastContext';
import MediaRenderer from './MediaRenderer';
import { aiContentBroadcaster } from '../services/AIContentBroadcaster';

interface ChatProps {
  sessionId?: string;
  onMediaShare?: (media: any) => void;
  isCollapsed?: boolean;
  onUnreadCountChange?: (count: number) => void;
}

// Format time as HH:MM AM/PM
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

// Format date as "Today", "Yesterday", or "MMM DD"
const formatDate = (date: Date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

export default function Chat({ onMediaShare, isCollapsed = false, onUnreadCountChange }: ChatProps) {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiService, setAiService] = useState<AIService | null>(null);
  const [isAIEnabled, setIsAIEnabled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previousMessagesLengthRef = useRef(0);

  // Initialize AI service
  useEffect(() => {
    try {
      const service = AIService.initialize();
      setAiService(service);
    } catch (err) {
      console.error('AI service not available:', err);
    }
  }, []);

  // Track scroll position to determine if user is at bottom
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const atBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px threshold
      setIsAtBottom(atBottom);
      
      // If scrolled to bottom, clear unread count
      if (atBottom && unreadCount > 0) {
        setUnreadCount(0);
        onUnreadCountChange?.(0);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [unreadCount, onUnreadCountChange]);

  // Auto-scroll to bottom when new messages arrive (only if already at bottom)
  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isAtBottom]);

  // Track unread messages when new messages arrive and not at bottom
  useEffect(() => {
    const newMessagesCount = messages.length - previousMessagesLengthRef.current;
    
    if (newMessagesCount > 0 && !isAtBottom && !isCollapsed) {
      // Only count messages from AI (not user's own messages)
      const newMessages = messages.slice(-newMessagesCount);
      const unreadMessages = newMessages.filter(msg => msg.role === 'assistant');
      
      if (unreadMessages.length > 0) {
        const newUnreadCount = unreadCount + unreadMessages.length;
        setUnreadCount(newUnreadCount);
        onUnreadCountChange?.(newUnreadCount);
      }
    }
    
    previousMessagesLengthRef.current = messages.length;
  }, [messages, isAtBottom, isCollapsed, unreadCount, onUnreadCountChange]);

  // Clear unread count when chat is expanded
  useEffect(() => {
    if (!isCollapsed && unreadCount > 0) {
      setUnreadCount(0);
      onUnreadCountChange?.(0);
    }
  }, [isCollapsed, unreadCount, onUnreadCountChange]);

  const handleSendMessage = useCallback(async () => {
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage) return;

    // Add user message
    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // If AI is enabled and available, get AI response
    if (isAIEnabled && aiService) {
      setIsLoading(true);
      try {
        // Get conversation context (last 10 messages)
        const context = messages.slice(-10);
        
        console.log('🔍 Sending message with full multimodal support (web search, image search, image generation)...');
        
        const result = await aiService.sendFullMultimodalMessage([...context, userMessage], {
          temperature: 0.7,
          maxTokens: 2000,
          enableProactiveImages: true, // Enable proactive image enhancement
          preferUnsplash: true, // Prefer Unsplash over DALL-E for cost savings
        });

        console.log('📸 Multimodal result:', {
          images: result.images ? `Found ${result.images.length} Unsplash images` : 'No Unsplash images',
          generatedImages: result.generatedImages ? `Generated ${result.generatedImages.length} DALL-E images` : 'No generated images',
          searchResults: result.searchResults ? `Found ${result.searchResults.length} search results` : 'No search results',
        });

        // Broadcast to AI Output Panel
        const allImages = [
          ...(result.images || []),
          ...(result.generatedImages || []),
        ];
        
        console.log('🎯 Broadcasting to AI Output Panel:', {
          hasImages: allImages.length > 0,
          hasSearchResults: result.searchResults && result.searchResults.length > 0,
          imageCount: allImages.length,
          searchResultCount: result.searchResults?.length || 0,
        });
        
        if (allImages.length > 0 || (result.searchResults && result.searchResults.length > 0)) {
          console.log('✅ Broadcasting multimodal content to AI Output Panel');
          aiContentBroadcaster.broadcast({
            id: `ai-content-${Date.now()}`,
            userQuery: trimmedMessage,
            textResponse: result.response.choices[0]?.message?.content || '',
            images: allImages,
            searchResults: result.searchResults || [],
            timestamp: new Date(),
            cost: {
              text: (result.response.usage.total_tokens / 1000) * 0.002,
              images: (result.generatedImages?.length || 0) * 0.02,
              search: (result.searchResults?.length || 0) * 0.001,
              total: ((result.response.usage.total_tokens / 1000) * 0.002) + 
                     ((result.generatedImages?.length || 0) * 0.02) + 
                     ((result.searchResults?.length || 0) * 0.001),
            },
            imageSource: result.images && result.images.length > 0 
              ? (result.generatedImages && result.generatedImages.length > 0 ? 'both' : 'unsplash')
              : (result.generatedImages && result.generatedImages.length > 0 ? 'dalle' : 'none'),
          });
        }

        // Combine Unsplash images and generated images for chat display
        const allMedia = [];
        
        // Add Unsplash images
        if (result.images) {
          allMedia.push(...result.images.map(img => ({
            type: 'image' as const,
            url: img.url,
            thumbnail: img.thumbnailUrl,
            title: img.description,
            description: `Photo by ${img.photographer} on Unsplash`,
            attribution: {
              photographer: img.photographer,
              photographerUrl: img.photographerUrl,
              source: 'Unsplash',
              sourceUrl: img.unsplashUrl,
            },
          })));
        }
        
        // Add generated images
        if (result.generatedImages) {
          allMedia.push(...result.generatedImages.map(img => ({
            type: 'image' as const,
            url: img.compressedUrl || img.url,
            thumbnail: img.compressedUrl || img.url,
            title: img.revisedPrompt || 'AI Generated Image',
            description: 'Generated by DALL-E',
            attribution: {
              photographer: 'DALL-E',
              photographerUrl: 'https://openai.com/dall-e',
              source: 'OpenAI',
              sourceUrl: img.url,
            },
          })));
        }

        const aiMessage: AIMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: result.response.choices[0]?.message?.content || 'Sorry, I could not generate a response.',
          timestamp: new Date(),
          media: allMedia.length > 0 ? allMedia : undefined,
        };
        
        setMessages(prev => [...prev, aiMessage]);
      } catch (err: any) {
        console.error('AI error:', err);
        const aiError = err as AIError;
        showToast(aiError.message || 'Failed to get AI response', 'error');
        
        // Add error message to chat
        const errorMessage: AIMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `Sorry, I encountered an error: ${aiError.message || 'Unknown error'}. Please try again.`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  }, [inputMessage, isAIEnabled, aiService, showToast, messages]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white" role="region" aria-label="Chat messages">
      {/* Unread indicator badge */}
      {unreadCount > 0 && isCollapsed && (
        <div 
          className="absolute top-2 right-2 z-10 bg-[#FDC500] text-[#03071E] text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse"
          role="status"
          aria-live="polite"
          aria-label={`${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        role="log"
        aria-live="polite"
        aria-atomic="false"
        aria-label="Chat message history"
      >
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8" role="status">
            <div className="w-20 h-20 glass-purple rounded-full flex items-center justify-center mb-4 animate-fade-in" aria-hidden="true">
              <MessageCircle className="w-10 h-10 text-[#5C0099]" />
            </div>
            <p className="text-gray-900 font-semibold text-base mb-2">Start a conversation</p>
            <p className="text-gray-500 text-sm max-w-xs">
              {isAIEnabled 
                ? 'Chat with your partner or ask the AI assistant for help'
                : 'Send messages to your learning partner'}
            </p>
          </div>
        )}

        {messages.map((message, index) => {
          const showDate = index === 0 || 
            formatDate(new Date(message.timestamp)) !== formatDate(new Date(messages[index - 1].timestamp));
          
          return (
            <div key={message.id}>
              {/* Date separator */}
              {showDate && (
                <div className="flex items-center justify-center my-6">
                  <div className="bg-gray-100 px-3 py-1.5 rounded-full">
                    <span className="text-xs text-gray-600 font-medium">
                      {formatDate(new Date(message.timestamp))}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Message */}
              <div
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                role="article"
                aria-label={`${message.role === 'user' ? 'Your message' : message.role === 'assistant' ? 'AI Assistant message' : 'Message'} at ${formatTime(new Date(message.timestamp))}`}
              >
                <div
                  className={`rounded-2xl max-w-[75%] shadow-lg transition-all duration-300 hover:scale-[1.02] ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-[#FDC500] to-[#FFD500] text-gray-900 rounded-br-md'
                      : message.role === 'assistant'
                      ? 'glass text-gray-900 rounded-bl-md'
                      : 'glass text-gray-900 rounded-bl-md'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="px-3 py-2 border-b border-white/20 flex items-center gap-2">
                      <div className="w-6 h-6 glass-purple rounded-full flex items-center justify-center" aria-hidden="true">
                        <Sparkles className="w-4 h-4 text-[#5C0099]" />
                      </div>
                      <span className="text-xs font-semibold text-[#5C0099]">AI Assistant</span>
                    </div>
                  )}
                  <div className="px-3 py-2">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                  {message.media && message.media.length > 0 && (
                    <div className="px-3 pb-3 space-y-2">
                      {message.media.map((media, mediaIndex) => (
                        <MediaRenderer 
                          key={mediaIndex} 
                          media={media}
                          attribution={media.attribution}
                          onShare={onMediaShare}
                        />
                      ))}
                    </div>
                  )}
                  {/* Timestamp */}
                  <div className={`px-3 pb-2 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <span className={`text-xs ${
                      message.role === 'user' ? 'text-gray-700/70' : 'text-gray-500'
                    }`}>
                      {formatTime(new Date(message.timestamp))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-center py-4 animate-fade-in" role="status" aria-live="polite" aria-label="AI is thinking">
            <div className="glass rounded-2xl p-4 shadow-lg">
              {/* Animated spinner with yellow glow */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  {/* Outer glow ring */}
                  <div 
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-600/20"
                    style={{ 
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }}
                  />
                  
                  {/* Spinning ring */}
                  <div className="absolute inset-0">
                    <div className="w-12 h-12 rounded-full border-4 border-yellow-200" />
                    <div 
                      className="absolute inset-0 w-12 h-12 rounded-full border-4 border-yellow-500 border-t-transparent"
                      style={{
                        animation: 'spin 1s cubic-bezier(0.16, 1, 0.3, 1) infinite'
                      }}
                    />
                  </div>

                  {/* Center sparkle icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles 
                      className="text-yellow-500" 
                      size={20}
                      style={{ 
                        animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                      }}
                    />
                  </div>

                  {/* Pulsing glow effect */}
                  <div 
                    className="absolute inset-0 rounded-full opacity-20"
                    style={{
                      background: 'radial-gradient(circle, rgba(253, 197, 0, 0.4) 0%, transparent 70%)',
                      animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
                    }}
                  />
                </div>

                {/* Animated dots with infinite loop */}
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full bg-yellow-500"
                    style={{ 
                      animation: 'bounce 1s infinite',
                      animationDelay: '0ms'
                    }}
                  />
                  <div 
                    className="w-2 h-2 rounded-full bg-yellow-500"
                    style={{ 
                      animation: 'bounce 1s infinite',
                      animationDelay: '150ms'
                    }}
                  />
                  <div 
                    className="w-2 h-2 rounded-full bg-yellow-500"
                    style={{ 
                      animation: 'bounce 1s infinite',
                      animationDelay: '300ms'
                    }}
                  />
                </div>

                {/* Message text */}
                <p 
                  className="text-sm font-medium text-gray-700"
                  style={{ 
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                  }}
                >
                  AI is thinking...
                </p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button when not at bottom and has unread */}
      {!isAtBottom && unreadCount > 0 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10 animate-fade-in">
          <button
            onClick={() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
              setIsAtBottom(true);
              setUnreadCount(0);
              onUnreadCountChange?.(0);
            }}
            className="glass-yellow text-gray-900 px-4 py-2 rounded-full shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 text-sm font-medium btn-press"
            aria-label={`Scroll to bottom - ${unreadCount} new message${unreadCount > 1 ? 's' : ''}`}
          >
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
            <span>{unreadCount} new message{unreadCount > 1 ? 's' : ''}</span>
          </button>
        </div>
      )}

      {/* Input Area */}
      <form 
        className="px-4 py-4 border-t border-white/20 glass-subtle flex-shrink-0"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        aria-label="Message input form"
      >
        {/* AI Mode Indicator */}
        {isAIEnabled && (
          <div 
            className="mb-3 flex items-center justify-between glass-purple px-3 py-2 rounded-lg animate-fade-in"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#5C0099]" aria-hidden="true" />
              <span className="text-xs text-[#5C0099] font-semibold">AI Mode Active</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAIEnabled(false)}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-all duration-300 px-2 py-1 hover:bg-white/50 rounded btn-press focus:outline-none focus:ring-2 focus:ring-[#5C0099] focus:ring-offset-2"
              aria-label="Exit AI mode and return to normal chat"
            >
              <X className="w-4 h-4" aria-hidden="true" />
              <span className="text-xs">Exit</span>
            </button>
          </div>
        )}
        
        <div className="flex gap-2">
          <label htmlFor="chat-input" className="sr-only">
            {isAIEnabled ? "Ask AI anything" : "Type a message"}
          </label>
          <input
            id="chat-input"
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isAIEnabled ? "Ask AI anything..." : "Type a message or ask AI..."}
            disabled={isLoading}
            aria-label={isAIEnabled ? "Ask AI anything" : "Type a message"}
            className="flex-1 px-4 py-3 glass border border-white/30 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#FDC500] focus:ring-2 focus:ring-[#FDC500]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          />
          
          {/* Send Button */}
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            aria-label="Send message"
            className="w-12 h-12 bg-[#FDC500] text-gray-900 rounded-xl font-medium hover:bg-[#FFD500] hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#FDC500] focus:ring-offset-2 btn-press shadow-lg flex items-center justify-center"
          >
            <Send className="w-5 h-5" aria-hidden="true" />
          </button>
          
          {/* Ask AI Button - Always show when not in AI mode */}
          {!isAIEnabled && (
            <button
              type="button"
              onClick={() => {
                if (!aiService) {
                  showToast('AI service is not available', 'error');
                  return;
                }
                setIsAIEnabled(true);
              }}
              disabled={isLoading}
              className="px-4 py-3 glass-purple rounded-xl flex items-center gap-2 text-[#5C0099] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#5C0099] focus:ring-offset-2 btn-press shadow-lg"
              aria-label={!aiService ? 'AI service not available' : 'Enable AI mode'}
            >
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              <span className="text-sm font-medium whitespace-nowrap">Ask AI</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
