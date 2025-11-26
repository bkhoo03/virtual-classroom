import { useEffect, useCallback } from 'react';
import { useClassroomContext } from '../contexts/ClassroomContext';
import {
  saveSession,
  loadSession,
  clearSession,
  saveVideoConfig,
  loadVideoConfig,
  saveAIMessages,
  loadAIMessages,
  savePresentationState,
  loadPresentationState,
  saveUIState,
  loadUIState,
  clearAllPersistedState,
  hasPersistedSession,
  isSessionValid
} from '../utils/sessionPersistence';

/**
 * Custom hook for managing session persistence
 * Automatically saves and restores critical state
 */
export function useSessionPersistence() {
  const { state, dispatch } = useClassroomContext();

  /**
   * Load persisted state on mount
   */
  useEffect(() => {
    const loadPersistedState = () => {
      // Check if there's a valid persisted session
      if (!hasPersistedSession() || !isSessionValid()) {
        // Clear old/invalid session data
        clearAllPersistedState();
        return;
      }

      try {
        // Load session info
        const session = loadSession();
        if (session) {
          dispatch({ type: 'SET_SESSION', payload: session });
        }

        // Load video config
        const videoConfig = loadVideoConfig();
        if (videoConfig) {
          dispatch({ type: 'SET_VIDEO_CONFIG', payload: videoConfig });
        }

        // Load AI messages
        const aiMessages = loadAIMessages();
        aiMessages.forEach(message => {
          dispatch({ type: 'ADD_AI_MESSAGE', payload: message });
        });

        // Load presentation state
        const presentationState = loadPresentationState();
        if (presentationState) {
          dispatch({ type: 'SET_PRESENTATION_MODE', payload: presentationState.mode });
          dispatch({ type: 'SET_CURRENT_PAGE', payload: presentationState.page });
          dispatch({ type: 'SET_ZOOM', payload: presentationState.zoom });
        }

        // Load UI state
        const uiState = loadUIState();
        if (uiState) {
          if (!uiState.isSidebarOpen) {
            dispatch({ type: 'TOGGLE_SIDEBAR' });
          }
          if (uiState.activePanel) {
            dispatch({ type: 'SET_ACTIVE_PANEL', payload: uiState.activePanel as any });
          }
        }

        console.log('Persisted state loaded successfully');
      } catch (error) {
        console.error('Error loading persisted state:', error);
        clearAllPersistedState();
      }
    };

    loadPersistedState();
  }, [dispatch]);

  /**
   * Persist session info when it changes
   */
  useEffect(() => {
    if (state.session) {
      saveSession(state.session);
    } else {
      clearSession();
    }
  }, [state.session]);

  /**
   * Persist video config when it changes
   */
  useEffect(() => {
    if (state.video.config) {
      saveVideoConfig(state.video.config);
    }
  }, [state.video.config]);

  /**
   * Persist AI messages when they change
   */
  useEffect(() => {
    if (state.ai.messages.length > 0) {
      saveAIMessages(state.ai.messages);
    }
  }, [state.ai.messages]);

  /**
   * Persist presentation state when it changes
   */
  useEffect(() => {
    savePresentationState(
      state.presentation.mode,
      state.presentation.currentPage,
      state.presentation.zoom
    );
  }, [state.presentation.mode, state.presentation.currentPage, state.presentation.zoom]);

  /**
   * Persist UI state when it changes
   */
  useEffect(() => {
    saveUIState({
      isSidebarOpen: state.ui.isSidebarOpen,
      activePanel: state.ui.activePanel
    });
  }, [state.ui.isSidebarOpen, state.ui.activePanel]);

  /**
   * Clear all persisted state
   */
  const clearPersistedState = useCallback(() => {
    clearAllPersistedState();
    console.log('All persisted state cleared');
  }, []);

  /**
   * Handle page unload - cleanup
   */
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // If there's an active session, warn the user
      if (state.session?.isActive) {
        event.preventDefault();
        event.returnValue = 'You have an active classroom session. Are you sure you want to leave?';
        return event.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [state.session]);

  /**
   * Handle session end - cleanup persisted state
   */
  const endSession = useCallback(() => {
    clearAllPersistedState();
    dispatch({ type: 'CLEAR_SESSION' });
    dispatch({ type: 'CLEAR_AI_MESSAGES' });
    
    console.log('Session ended and state cleared');
  }, [dispatch]);

  return {
    clearPersistedState,
    endSession,
    hasPersistedSession: hasPersistedSession(),
    isSessionValid: isSessionValid()
  };
}
