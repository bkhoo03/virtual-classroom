import { useState, useEffect, useCallback, useRef } from 'react';
import AIService from '../services/AIService';
import type { AIMessage, AIError } from '../types/ai.types';
import { useToast } from '../contexts/ToastContext';
import MediaRenderer from './MediaRenderer';

interface ChatProps {
  sessionId?: string;
  onMediaShare?: (media: any) => void;
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

export default function Chat({ onMediaShare }: ChatProps) {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiService, setAiService] = useState<AIService | null>(null);
  const [isAIEnabled, setIsAIEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize AI service
  useEffect(() => {
    try {
      const service = AIService.initialize();
      setAiService(service);
    } catch (err) {
      console.error('AI service not available:', err);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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
        const response = await aiService.sendMessage([...context, userMessage], {
          temperature: 0.7,
          maxTokens: 2000,
        });

        const aiMessage: AIMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: response.choices[0]?.message?.content || 'Sorry, I could not generate a response.',
          timestamp: new Date(),
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
      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        role="log"
        aria-live="polite"
        aria-atomic="false"
        aria-label="Chat message history"
      >
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8" role="status">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4" aria-hidden="true">
              <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
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
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                role="article"
                aria-label={`${message.role === 'user' ? 'Your message' : message.role === 'assistant' ? 'AI Assistant message' : 'Message'} at ${formatTime(new Date(message.timestamp))}`}
              >
                <div
                  className={`rounded-2xl max-w-[75%] shadow-sm ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white rounded-br-md'
                      : message.role === 'assistant'
                      ? 'bg-gray-100 text-gray-900 rounded-bl-md border border-gray-200'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md border border-gray-200'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="px-3 py-2 border-b border-gray-200 flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center" aria-hidden="true">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold text-purple-600">AI Assistant</span>
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
                          onShare={onMediaShare}
                        />
                      ))}
                    </div>
                  )}
                  {/* Timestamp */}
                  <div className={`px-3 pb-2 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <span className={`text-xs ${
                      message.role === 'user' ? 'text-white/70' : 'text-gray-500'
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
          <div className="flex justify-start" role="status" aria-live="polite" aria-label="AI is thinking">
            <div className="bg-gray-100 border border-gray-200 text-gray-900 rounded-2xl rounded-bl-md px-3 py-2 max-w-[75%] shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} aria-hidden="true"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} aria-hidden="true"></div>
                <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} aria-hidden="true"></div>
                <span className="text-sm text-gray-600 ml-1">AI thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form 
        className="px-4 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        aria-label="Message input form"
      >
        {/* AI Mode Indicator */}
        {isAIEnabled && (
          <div 
            className="mb-3 flex items-center justify-between bg-purple-50 border border-purple-200 px-3 py-2 rounded-lg"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-xs text-purple-700 font-semibold">AI Mode Active</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAIEnabled(false)}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors px-2 py-1 hover:bg-white rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label="Exit AI mode and return to normal chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
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
            className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
          />
          
          {/* Send Button */}
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            aria-label="Send message"
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Send
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
              className="px-4 py-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-2 text-purple-600 hover:bg-purple-100 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label={!aiService ? 'AI service not available' : 'Enable AI mode'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-sm font-medium whitespace-nowrap">Ask AI</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
