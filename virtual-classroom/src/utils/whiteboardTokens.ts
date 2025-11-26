import { apiClient } from './apiClient';

/**
 * Generate a whiteboard room token from the backend
 * In production, this should call your backend API which securely generates tokens
 */
export async function generateWhiteboardToken(
  roomId: string,
  userId: string,
  role: 'admin' | 'writer' | 'reader' = 'writer'
): Promise<string> {
  try {
    const response = await apiClient.post('/api/tokens/whiteboard', {
      roomId,
      role,
    });

    return response.data.token;
  } catch (error) {
    console.error('Failed to generate whiteboard token:', error);
    
    // For development/testing, return a mock token
    // In production, this should throw an error
    if (import.meta.env.DEV) {
      console.warn('Using mock whiteboard token for development');
      return 'MOCK_WHITEBOARD_TOKEN_' + Date.now();
    }
    
    throw error;
  }
}

/**
 * Create a new whiteboard room
 * In production, this should call your backend API
 */
export async function createWhiteboardRoom(sessionId: string): Promise<{
  roomId: string;
  roomToken: string;
}> {
  try {
    const response = await apiClient.post('/api/tokens/whiteboard', {
      roomId: sessionId,
    });

    return {
      roomId: sessionId,
      roomToken: response.data.token,
    };
  } catch (error) {
    console.error('Failed to create whiteboard room:', error);
    
    // For development/testing, return mock data
    if (import.meta.env.DEV) {
      console.warn('Using mock whiteboard room for development');
      return {
        roomId: 'mock_room_' + sessionId,
        roomToken: 'MOCK_ROOM_TOKEN_' + Date.now(),
      };
    }
    
    throw error;
  }
}
