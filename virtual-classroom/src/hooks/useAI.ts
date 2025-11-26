import { useCallback } from 'react';
import { useClassroomContext } from '../contexts/ClassroomContext';
import AIService from '../services/AIService';
import type { AIMessage, MediaContent, AIServiceConfig } from '../types/ai.types';

// Create a singleton AI service instance
let aiServiceInstance: AIService | null = null;

function getAIService(config?: AIServiceConfig): AIService {
  if (!aiServiceInstance && config) {
    aiServiceInstance = new AIService(config);
  }
  if (!aiServiceInstance) {
    throw new Error('AI Service not initialized. Please provide config on first use.');
  }
  return aiServiceInstance;
}

/**
 * Custom hook for managing AI assistant state and operations
 */
export function useAI(config?: AIServiceConfig) {
  const { state, dispatch } = useClassroomContext();

  /**
   * Send a message to the AI assistant
   */
  const sendMessage = useCallback(async (content: string) => {
    try {
      // Add user message to state
      const userMessage: AIMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date()
      };
      dispatch({ type: 'ADD_AI_MESSAGE', payload: userMessage });

      // Set loading state
      dispatch({ type: 'SET_AI_LOADING', payload: true });
      dispatch({ type: 'SET_AI_ERROR', payload: null });

      // Get AI service
      const aiService = getAIService(config);

      // Send message and get response
      const response = await aiService.sendMessage(
        state.ai.messages.concat(userMessage)
      );

      // Extract content from Doubao response
      const responseContent = response.choices[0]?.message?.content || 'No response';

      // Add AI response to state
      const aiMessage: AIMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };
      dispatch({ type: 'ADD_AI_MESSAGE', payload: aiMessage });

      return aiMessage;
    } catch (error) {
      console.error('Error sending message to AI:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      dispatch({ type: 'SET_AI_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_AI_LOADING', payload: false });
    }
  }, [state.ai.messages, config, dispatch]);

  /**
   * Send a message with image context
   * Note: Image context is stored in the message but sent as text to the AI
   */
  const sendMessageWithImage = useCallback(async (content: string, imageUrl: string) => {
    try {
      // Add user message to state with image reference
      const userMessage: AIMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: `${content}\n[Image: ${imageUrl}]`,
        media: [{
          type: 'image',
          url: imageUrl
        }],
        timestamp: new Date()
      };
      dispatch({ type: 'ADD_AI_MESSAGE', payload: userMessage });

      // Set loading state
      dispatch({ type: 'SET_AI_LOADING', payload: true });
      dispatch({ type: 'SET_AI_ERROR', payload: null });

      // Get AI service
      const aiService = getAIService(config);

      // Send message and get response
      const response = await aiService.sendMessage(
        state.ai.messages.concat(userMessage)
      );

      // Extract content from Doubao response
      const responseContent = response.choices[0]?.message?.content || 'No response';

      // Add AI response to state
      const aiMessage: AIMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };
      dispatch({ type: 'ADD_AI_MESSAGE', payload: aiMessage });

      return aiMessage;
    } catch (error) {
      console.error('Error sending message with image to AI:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      dispatch({ type: 'SET_AI_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_AI_LOADING', payload: false });
    }
  }, [state.ai.messages, config, dispatch]);

  /**
   * Share media content to the presentation panel
   */
  const shareMediaToPresentation = useCallback((media: MediaContent) => {
    dispatch({ type: 'SHARE_MEDIA_TO_PRESENTATION', payload: media });
    
    // Add notification
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `notification-${Date.now()}`,
        type: 'success',
        message: 'Media shared to presentation',
        timestamp: new Date(),
        duration: 3000
      }
    });
  }, [dispatch]);

  /**
   * Clear the shared media
   */
  const clearSharedMedia = useCallback(() => {
    dispatch({ type: 'CLEAR_SHARED_MEDIA' });
  }, [dispatch]);

  /**
   * Clear all AI messages
   */
  const clearMessages = useCallback(() => {
    dispatch({ type: 'CLEAR_AI_MESSAGES' });
    sessionStorage.removeItem('classroom_ai_messages');
  }, [dispatch]);

  /**
   * Retry the last failed message
   */
  const retryLastMessage = useCallback(async () => {
    const lastMessage = state.ai.messages[state.ai.messages.length - 1];
    if (lastMessage && lastMessage.role === 'user') {
      return await sendMessage(lastMessage.content);
    }
  }, [state.ai.messages, sendMessage]);

  return {
    // State
    messages: state.ai.messages,
    isLoading: state.ai.isLoading,
    error: state.ai.error,
    sharedMedia: state.ai.sharedMedia,

    // Actions
    sendMessage,
    sendMessageWithImage,
    shareMediaToPresentation,
    clearSharedMedia,
    clearMessages,
    retryLastMessage
  };
}
