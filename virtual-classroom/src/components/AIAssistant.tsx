import { useState, useEffect, useCallback } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import AIService from '../services/AIService';
import type { AIMessage, AIError } from '../types/ai.types';
import { useAIConversation } from '../hooks/useAIConversation';
import { useToast } from '../contexts/ToastContext';

interface AIAssistantProps {
  sessionId?: string;
  onMediaShare?: (media: any) => void;
  enableAI?: boolean; // Option to disable AI assistant
}

export default function AIAssistant({ sessionId, onMediaShare, enableAI = true }: AIAssistantProps) {
  const { messages, addMessage, getContext } = useAIConversation({ sessionId });
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [aiService, setAiService] = useState<AIService | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Initialize AI service
  useEffect(() => {
    try {
      const service = AIService.initialize();
      setAiService(service);
    } catch (err) {
      console.error('Failed to initialize AI service:', err);
      setError('AI service is not available. Please check configuration.');
    }
  }, []);

  const handleSendMessage = useCallback(async (content: string, isRetry: boolean = false) => {
    if (!aiService) {
      setError('AI service is not initialized');
      showToast('AI service is not available', 'error');
      return;
    }

    // Check rate limit status before sending
    const rateLimitStatus = aiService.getRateLimitStatus();
    if (rateLimitStatus.requestsRemaining === 0) {
      const waitTime = Math.ceil((rateLimitStatus.resetTime - Date.now()) / 1000);
      const errorMsg = `Rate limit reached. Please wait ${waitTime} seconds before sending another message.`;
      setError(errorMsg);
      showToast(errorMsg, 'warning', 5000);
      return;
    }

    // Add user message (only if not a retry)
    if (!isRetry) {
      const userMessage: AIMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date(),
      };
      addMessage(userMessage);
      setRetryCount(0);
    }

    setIsLoading(true);
    setError(null);
    if (isRetry) {
      setIsRetrying(true);
    }

    try {
      // Get conversation context (last 10 messages for context)
      const context = getContext(10);
      
      // Send message to AI service with context
      const response = await aiService.sendMessage([...context], {
        temperature: 0.7,
        maxTokens: 2000,
      });
      
      // Add AI response
      const aiMessage: AIMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.choices[0]?.message?.content || 'Sorry, I could not generate a response.',
        timestamp: new Date(),
      };

      addMessage(aiMessage);
      setRetryCount(0);
      
      if (isRetry) {
        showToast('Message sent successfully', 'success', 3000);
      }
    } catch (err: any) {
      console.error('Failed to send message:', err);
      
      const aiError = err as AIError;
      let errorMessage = aiError.message || 'Failed to send message. Please try again.';
      
      // Handle specific error types
      if (aiError.code === 'RATE_LIMIT_EXCEEDED') {
        setError(errorMessage);
        showToast(errorMessage, 'warning', 5000);
      } else if (aiError.retryable && retryCount < 2) {
        // Implement exponential backoff retry
        const delay = Math.pow(2, retryCount) * 1000;
        setRetryCount(prev => prev + 1);
        setError(`Request failed. Retrying in ${delay / 1000} seconds...`);
        showToast(`Request failed. Retrying (${retryCount + 1}/2)...`, 'warning', 3000);
        
        setTimeout(() => {
          handleSendMessage(content, true);
        }, delay);
        return;
      } else {
        setError(errorMessage);
        
        if (aiError.code === 'API_ERROR') {
          showToast('AI service error. Please try again later.', 'error', 5000);
        } else if (aiError.code === 'STREAM_ERROR') {
          showToast('Connection error. Please check your internet connection.', 'error', 5000);
        } else {
          showToast('Failed to get AI response. Please try again.', 'error', 5000);
        }
        
        // Add error message to chat
        const errorChatMessage: AIMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `Sorry, I encountered an error: ${aiError.message || 'Unknown error'}. Please try again.`,
          timestamp: new Date(),
        };
        addMessage(errorChatMessage);
      }
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, [aiService, addMessage, getContext, retryCount, showToast]);

  return (
    <div className="bg-transparent h-full flex flex-col">
      {/* Header - removed as it's now in ClassroomLayout */}

      {/* AI Disabled Message */}
      {!enableAI && (
        <div className="mb-3 p-4 bg-gray-500/10 border border-gray-500/30 rounded-lg flex items-start gap-3">
          <svg className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-gray-300 text-sm font-medium">AI Assistant Disabled</p>
            <p className="text-gray-400 text-xs mt-1">The AI assistant feature is currently disabled for this session.</p>
          </div>
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-red-300 text-sm">{error}</p>
            {isRetrying && (
              <p className="text-red-400 text-xs mt-1">Retrying...</p>
            )}
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Rate limit warning */}
      {aiService && (() => {
        const status = aiService.getRateLimitStatus();
        if (status.requestsRemaining <= 3 && status.requestsRemaining > 0) {
          return (
            <div className="mb-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-start gap-2">
              <svg className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-orange-300 text-sm">
                {status.requestsRemaining} requests remaining. Rate limit resets soon.
              </p>
            </div>
          );
        }
        return null;
      })()}
      
      {/* Chat messages area */}
      <MessageList 
        messages={messages} 
        isLoading={isLoading}
        onMediaShare={onMediaShare}
      />

      {/* Input area with cancel button when loading */}
      {isLoading ? (
        <div className="flex gap-2 items-center">
          <div className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white/50 text-sm">
            AI is thinking...
          </div>
          <button
            onClick={() => {
              setIsLoading(false);
              setError('Request cancelled by user');
            }}
            className="px-4 py-2 bg-red-500 rounded-lg flex items-center gap-2 text-white text-sm font-medium hover:bg-red-600 transition-all duration-300"
            aria-label="Cancel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
        </div>
      ) : (
        <MessageInput 
          onSendMessage={handleSendMessage} 
          disabled={isLoading || !aiService || !enableAI}
          placeholder={
            !enableAI 
              ? "AI assistant is disabled" 
              : aiService 
                ? "Ask me anything..." 
                : "AI service unavailable"
          }
          showAskAI={enableAI && !!aiService}
        />
      )}
    </div>
  );
}
