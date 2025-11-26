/**
 * Session persistence utilities for storing and recovering classroom state
 */

import type { SessionInfo } from '../types';
import type { VideoCallConfig } from '../types/video.types';
import type { AIMessage } from '../types/ai.types';
import type { PresentationMode } from '../types';

// Storage keys
const STORAGE_KEYS = {
  SESSION: 'classroom_session',
  VIDEO_CONFIG: 'classroom_video_config',
  AI_MESSAGES: 'classroom_ai_messages',
  PRESENTATION_MODE: 'classroom_presentation_mode',
  PRESENTATION_PAGE: 'classroom_presentation_page',
  PRESENTATION_ZOOM: 'classroom_presentation_zoom',
  UI_STATE: 'classroom_ui_state'
} as const;

/**
 * Save session information to session storage
 */
export function saveSession(session: SessionInfo): void {
  try {
    sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

/**
 * Load session information from session storage
 */
export function loadSession(): SessionInfo | null {
  try {
    const data = sessionStorage.getItem(STORAGE_KEYS.SESSION);
    if (!data) return null;

    const session = JSON.parse(data);
    // Convert date strings back to Date objects
    if (session.startTime) {
      session.startTime = new Date(session.startTime);
    }
    if (session.participants) {
      session.participants = session.participants.map((p: any) => ({
        ...p,
        joinedAt: new Date(p.joinedAt)
      }));
    }
    return session;
  } catch (error) {
    console.error('Failed to load session:', error);
    return null;
  }
}

/**
 * Clear session information from session storage
 */
export function clearSession(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.SESSION);
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
}

/**
 * Save video call configuration
 */
export function saveVideoConfig(config: VideoCallConfig): void {
  try {
    sessionStorage.setItem(STORAGE_KEYS.VIDEO_CONFIG, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save video config:', error);
  }
}

/**
 * Load video call configuration
 */
export function loadVideoConfig(): VideoCallConfig | null {
  try {
    const data = sessionStorage.getItem(STORAGE_KEYS.VIDEO_CONFIG);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load video config:', error);
    return null;
  }
}

/**
 * Clear video call configuration
 */
export function clearVideoConfig(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.VIDEO_CONFIG);
  } catch (error) {
    console.error('Failed to clear video config:', error);
  }
}

/**
 * Save AI conversation messages
 */
export function saveAIMessages(messages: AIMessage[]): void {
  try {
    // Convert messages to a serializable format
    const serializedMessages = messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp.toISOString()
    }));
    sessionStorage.setItem(STORAGE_KEYS.AI_MESSAGES, JSON.stringify(serializedMessages));
  } catch (error) {
    console.error('Failed to save AI messages:', error);
  }
}

/**
 * Load AI conversation messages
 */
export function loadAIMessages(): AIMessage[] {
  try {
    const data = sessionStorage.getItem(STORAGE_KEYS.AI_MESSAGES);
    if (!data) return [];

    const messages = JSON.parse(data);
    // Convert timestamp strings back to Date objects
    return messages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
  } catch (error) {
    console.error('Failed to load AI messages:', error);
    return [];
  }
}

/**
 * Clear AI conversation messages
 */
export function clearAIMessages(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.AI_MESSAGES);
  } catch (error) {
    console.error('Failed to clear AI messages:', error);
  }
}

/**
 * Save presentation state
 */
export function savePresentationState(mode: PresentationMode, page: number, zoom: number): void {
  try {
    sessionStorage.setItem(STORAGE_KEYS.PRESENTATION_MODE, mode);
    sessionStorage.setItem(STORAGE_KEYS.PRESENTATION_PAGE, String(page));
    sessionStorage.setItem(STORAGE_KEYS.PRESENTATION_ZOOM, String(zoom));
  } catch (error) {
    console.error('Failed to save presentation state:', error);
  }
}

/**
 * Load presentation state
 */
export function loadPresentationState(): { mode: PresentationMode; page: number; zoom: number } | null {
  try {
    const mode = sessionStorage.getItem(STORAGE_KEYS.PRESENTATION_MODE) as PresentationMode;
    const page = sessionStorage.getItem(STORAGE_KEYS.PRESENTATION_PAGE);
    const zoom = sessionStorage.getItem(STORAGE_KEYS.PRESENTATION_ZOOM);

    if (!mode) return null;

    return {
      mode,
      page: page ? parseInt(page, 10) : 1,
      zoom: zoom ? parseFloat(zoom) : 1.0
    };
  } catch (error) {
    console.error('Failed to load presentation state:', error);
    return null;
  }
}

/**
 * Clear presentation state
 */
export function clearPresentationState(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.PRESENTATION_MODE);
    sessionStorage.removeItem(STORAGE_KEYS.PRESENTATION_PAGE);
    sessionStorage.removeItem(STORAGE_KEYS.PRESENTATION_ZOOM);
  } catch (error) {
    console.error('Failed to clear presentation state:', error);
  }
}

/**
 * Save UI state
 */
export function saveUIState(state: { isSidebarOpen: boolean; activePanel: string | null }): void {
  try {
    sessionStorage.setItem(STORAGE_KEYS.UI_STATE, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save UI state:', error);
  }
}

/**
 * Load UI state
 */
export function loadUIState(): { isSidebarOpen: boolean; activePanel: string | null } | null {
  try {
    const data = sessionStorage.getItem(STORAGE_KEYS.UI_STATE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load UI state:', error);
    return null;
  }
}

/**
 * Clear UI state
 */
export function clearUIState(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.UI_STATE);
  } catch (error) {
    console.error('Failed to clear UI state:', error);
  }
}

/**
 * Clear all persisted classroom state
 */
export function clearAllPersistedState(): void {
  clearSession();
  clearVideoConfig();
  clearAIMessages();
  clearPresentationState();
  clearUIState();
}

/**
 * Check if there is any persisted session data
 */
export function hasPersistedSession(): boolean {
  return sessionStorage.getItem(STORAGE_KEYS.SESSION) !== null;
}

/**
 * Get the age of the persisted session in milliseconds
 */
export function getSessionAge(): number | null {
  try {
    const session = loadSession();
    if (!session || !session.startTime) return null;

    return Date.now() - new Date(session.startTime).getTime();
  } catch (error) {
    console.error('Failed to get session age:', error);
    return null;
  }
}

/**
 * Check if the persisted session is still valid (less than 24 hours old)
 */
export function isSessionValid(): boolean {
  const age = getSessionAge();
  if (age === null) return false;

  const MAX_SESSION_AGE = 24 * 60 * 60 * 1000; // 24 hours
  return age < MAX_SESSION_AGE;
}
