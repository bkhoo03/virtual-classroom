import { useState, useEffect, useCallback } from 'react';
import { AIMessage } from '../types/ai.types';

interface UseAIConversationOptions {
  sessionId?: string;
  maxMessages?: number;
}

/**
 * Custom hook for managing AI conversation history with session persistence
 */
export function useAIConversation(options: UseAIConversationOptions = {}) {
  const { sessionId, maxMessages = 50 } = options;
  const [messages, setMessages] = useState<AIMessage[]>([]);

  // Generate storage key based on session ID
  const getStorageKey = useCallback(() => {
    return sessionId ? `ai-conversation-${sessionId}` : 'ai-conversation-default';
  }, [sessionId]);

  // Load conversation history from session storage
  useEffect(() => {
    const storageKey = getStorageKey();
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDates);
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    }
  }, [getStorageKey]);

  // Save conversation history to session storage whenever it changes
  useEffect(() => {
    if (messages.length > 0) {
      const storageKey = getStorageKey();
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(messages));
      } catch (error) {
        console.error('Failed to save conversation history:', error);
      }
    }
  }, [messages, getStorageKey]);

  // Add a new message to the conversation
  const addMessage = useCallback((message: AIMessage) => {
    setMessages(prev => {
      const updated = [...prev, message];
      // Limit the number of messages to prevent storage overflow
      if (updated.length > maxMessages) {
        return updated.slice(updated.length - maxMessages);
      }
      return updated;
    });
  }, [maxMessages]);

  // Clear conversation history
  const clearMessages = useCallback(() => {
    setMessages([]);
    const storageKey = getStorageKey();
    try {
      sessionStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Failed to clear conversation history:', error);
    }
  }, [getStorageKey]);

  // Get conversation context for API requests (last N messages)
  const getContext = useCallback((contextSize: number = 10): AIMessage[] => {
    return messages.slice(-contextSize);
  }, [messages]);

  return {
    messages,
    addMessage,
    clearMessages,
    getContext,
  };
}
