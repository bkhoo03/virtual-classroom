import axios from 'axios';
import AuthService from './AuthService';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

interface SessionValidationResponse {
  valid: boolean;
  session?: {
    id: string;
    tutorId: string;
    tuteeId: string;
    status: string;
    agoraChannelName: string;
    whiteboardRoomId: string;
  };
  message?: string;
}

interface AgoraTokenResponse {
  token: string;
  uid: number;
  channelName: string;
  expiresAt: number;
}

interface WhiteboardTokenResponse {
  roomToken: string;
  roomId: string;
  expiresAt: number;
}

class SessionSecurityService {
  private static instance: SessionSecurityService;

  private constructor() {}

  public static getInstance(): SessionSecurityService {
    if (!SessionSecurityService.instance) {
      SessionSecurityService.instance = new SessionSecurityService();
    }
    return SessionSecurityService.instance;
  }

  /**
   * Generate a unique session identifier
   */
  public generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    const randomPart2 = Math.random().toString(36).substring(2, 15);
    return `session-${timestamp}-${randomPart}${randomPart2}`;
  }

  /**
   * Validate session access before joining
   */
  public async validateSessionAccess(sessionId: string): Promise<SessionValidationResponse> {
    try {
      const response = await axios.get<SessionValidationResponse>(
        `${API_BASE_URL}/api/sessions/${sessionId}/validate`,
        {
          headers: AuthService.getAuthHeaders()
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          valid: false,
          message: error.response?.data?.message || 'Session validation failed'
        };
      }
      return {
        valid: false,
        message: 'An unexpected error occurred during session validation'
      };
    }
  }

  /**
   * Create a new session
   */
  public async createSession(tuteeId?: string): Promise<string> {
    try {
      const sessionId = this.generateSessionId();
      
      const response = await axios.post(
        `${API_BASE_URL}/api/sessions`,
        {
          sessionId,
          tuteeId
        },
        {
          headers: AuthService.getAuthHeaders()
        }
      );

      return response.data.sessionId;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create session');
      }
      throw new Error('An unexpected error occurred while creating session');
    }
  }

  /**
   * Get Agora RTC token for video call
   */
  public async getAgoraToken(
    sessionId: string,
    channelName: string,
    role: 'publisher' | 'subscriber' = 'publisher'
  ): Promise<AgoraTokenResponse> {
    try {
      const response = await axios.post<AgoraTokenResponse>(
        `${API_BASE_URL}/api/tokens/agora`,
        {
          sessionId,
          channelName,
          role
        },
        {
          headers: AuthService.getAuthHeaders()
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to get Agora token');
      }
      throw new Error('An unexpected error occurred while getting Agora token');
    }
  }

  /**
   * Get Whiteboard token
   */
  public async getWhiteboardToken(
    sessionId: string,
    roomId: string
  ): Promise<WhiteboardTokenResponse> {
    try {
      const response = await axios.post<WhiteboardTokenResponse>(
        `${API_BASE_URL}/api/tokens/whiteboard`,
        {
          sessionId,
          roomId
        },
        {
          headers: AuthService.getAuthHeaders()
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to get whiteboard token');
      }
      throw new Error('An unexpected error occurred while getting whiteboard token');
    }
  }

  /**
   * End a session and cleanup
   */
  public async endSession(sessionId: string): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/api/sessions/${sessionId}/end`,
        {},
        {
          headers: AuthService.getAuthHeaders()
        }
      );
    } catch (error) {
      console.error('Failed to end session:', error);
      throw error;
    }
  }

  /**
   * Check if user has access to session
   */
  public async checkSessionAccess(sessionId: string, userId: string): Promise<boolean> {
    try {
      const validation = await this.validateSessionAccess(sessionId);
      
      if (!validation.valid || !validation.session) {
        return false;
      }

      // Check if user is either tutor or tutee
      return (
        validation.session.tutorId === userId ||
        validation.session.tuteeId === userId
      );
    } catch (error) {
      console.error('Session access check failed:', error);
      return false;
    }
  }
}

export default SessionSecurityService.getInstance();
