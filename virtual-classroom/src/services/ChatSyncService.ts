import { io, Socket } from 'socket.io-client';

/**
 * ChatSyncService handles real-time chat message synchronization across users
 * Uses Socket.IO for WebSocket communication
 */

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  sessionId: string;
}

type ChatMessageCallback = (message: ChatMessage) => void;
type TypingCallback = (userId: string, userName: string, isTyping: boolean) => void;

class ChatSyncService {
  private messageCallbacks: Map<string, ChatMessageCallback[]> = new Map();
  private typingCallbacks: Map<string, TypingCallback[]> = new Map();
  private socket: Socket | null = null;
  private currentSessionId: string | null = null;
  private currentUserId: string | null = null;
  private currentUserName: string | null = null;
  private typingTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeSocket();
  }

  /**
   * Initialize Socket.IO connection
   */
  private initializeSocket(): void {
    // Get backend URL from environment
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    
    // Only initialize if backend URL is configured
    if (!backendUrl || backendUrl.includes('vercel.app')) {
      console.log('💬 [ChatSync] WebSocket disabled (no backend URL or using Vercel)');
      console.log('💬 [ChatSync] Chat will work locally but messages won\'t sync across users');
      return;
    }
    
    try {
      this.socket = io(backendUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('💬 [ChatSync] Connected to WebSocket server');
        // Rejoin session if we were in one
        if (this.currentSessionId && this.currentUserId && this.currentUserName) {
          this.joinSession(this.currentSessionId, this.currentUserId, this.currentUserName);
        }
      });

      this.socket.on('disconnect', () => {
        console.log('💬 [ChatSync] Disconnected from WebSocket server');
      });

      // Listen for incoming chat messages
      this.socket.on('chat-message', (message: ChatMessage) => {
        console.log('💬 [ChatSync] Received message:', message);
        
        // Don't process our own messages (they're already in the UI)
        if (message.senderId === this.currentUserId) {
          return;
        }

        // Notify subscribers
        const callbacks = this.messageCallbacks.get(message.sessionId);
        if (callbacks) {
          callbacks.forEach(callback => {
            try {
              callback(message);
            } catch (error) {
              console.error('Error in chat message callback:', error);
            }
          });
        }
      });

      // Listen for typing indicators
      this.socket.on('user-typing', ({ userId, userName, isTyping }: { userId: string; userName: string; isTyping: boolean }) => {
        console.log('💬 [ChatSync] User typing:', { userId, userName, isTyping });
        
        // Don't show our own typing indicator
        if (userId === this.currentUserId) {
          return;
        }

        // Notify subscribers
        if (this.currentSessionId) {
          const callbacks = this.typingCallbacks.get(this.currentSessionId);
          if (callbacks) {
            callbacks.forEach(callback => {
              try {
                callback(userId, userName, isTyping);
              } catch (error) {
                console.error('Error in typing callback:', error);
              }
            });
          }
        }
      });

      this.socket.on('connect_error', (error) => {
        console.warn('💬 [ChatSync] Connection error (WebSocket sync disabled):', error.message);
      });
    } catch (error) {
      console.warn('💬 [ChatSync] Failed to initialize WebSocket:', error);
    }
  }

  /**
   * Join a chat session
   */
  joinSession(sessionId: string, userId: string, userName: string): void {
    this.currentSessionId = sessionId;
    this.currentUserId = userId;
    this.currentUserName = userName;

    if (this.socket?.connected) {
      this.socket.emit('join-chat-session', { sessionId, userId, userName });
      console.log('💬 [ChatSync] Joined chat session:', { sessionId, userId, userName });
    }
  }

  /**
   * Leave the current chat session
   */
  leaveSession(): void {
    if (this.socket?.connected && this.currentSessionId) {
      this.socket.emit('leave-chat-session', { 
        sessionId: this.currentSessionId,
        userId: this.currentUserId 
      });
      console.log('💬 [ChatSync] Left chat session:', this.currentSessionId);
    }
    
    this.currentSessionId = null;
    this.currentUserId = null;
    this.currentUserName = null;
  }

  /**
   * Subscribe to chat messages for a specific session
   */
  subscribeToMessages(sessionId: string, callback: ChatMessageCallback): () => void {
    if (!this.messageCallbacks.has(sessionId)) {
      this.messageCallbacks.set(sessionId, []);
    }
    
    this.messageCallbacks.get(sessionId)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.messageCallbacks.get(sessionId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Subscribe to typing indicators for a specific session
   */
  subscribeToTyping(sessionId: string, callback: TypingCallback): () => void {
    if (!this.typingCallbacks.has(sessionId)) {
      this.typingCallbacks.set(sessionId, []);
    }
    
    this.typingCallbacks.get(sessionId)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.typingCallbacks.get(sessionId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Send a chat message
   */
  sendMessage(message: ChatMessage): void {
    if (!this.socket?.connected) {
      console.warn('💬 [ChatSync] Cannot send message - socket not connected');
      return;
    }

    this.socket.emit('send-chat-message', message);
    console.log('💬 [ChatSync] Sent message:', message);
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(isTyping: boolean): void {
    if (!this.socket?.connected || !this.currentSessionId || !this.currentUserId || !this.currentUserName) {
      return;
    }

    // Clear existing timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }

    // Send typing indicator
    this.socket.emit('typing-indicator', {
      sessionId: this.currentSessionId,
      userId: this.currentUserId,
      userName: this.currentUserName,
      isTyping
    });

    // Auto-stop typing after 3 seconds
    if (isTyping) {
      this.typingTimeout = setTimeout(() => {
        this.sendTypingIndicator(false);
      }, 3000);
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.leaveSession();
    
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    
    this.socket?.disconnect();
    this.messageCallbacks.clear();
    this.typingCallbacks.clear();
  }
}

// Export singleton instance
export const chatSyncService = new ChatSyncService();
export default chatSyncService;
