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
 * Calls the backend API which creates a room via Netless REST API
 * Returns the actual Netless room UUID and a valid room token
 */
export async function createWhiteboardRoom(sessionId: string): Promise<{
  roomId: string;
  roomToken: string;
}> {
  try {
    console.log('Creating whiteboard room for session:', sessionId);
    
    const response = await apiClient.post('/api/tokens/whiteboard', {
      roomId: sessionId,
      role: 'admin'
    });

    // The backend now returns the actual Netless room UUID
    const { token, roomId } = response.data;
    
    console.log('Whiteboard room created:', { roomId, hasToken: !!token });

    return {
      roomId: roomId, // Use the UUID returned by the backend
      roomToken: token,
    };
  } catch (error: any) {
    console.error('Failed to create whiteboard room:', error);
    console.error('Error details:', {
      status: error?.response?.status,
      message: error?.response?.data?.message || error?.message,
      url: error?.config?.url
    });
    
    // Check if it's an auth error
    if (error?.response?.status === 401) {
      console.error('Authentication required - please log in first');
    }
    
    // For development/testing without backend, return mock data
    // Note: This won't work with the real Netless SDK
    if (import.meta.env.DEV) {
      console.warn('Using mock whiteboard room for development - whiteboard will not work without backend');
      console.warn('Make sure you are logged in and the backend is running on port 3001');
      return {
        roomId: 'mock_room_' + sessionId,
        roomToken: 'MOCK_ROOM_TOKEN_' + Date.now(),
      };
    }
    
    throw error;
  }
}
