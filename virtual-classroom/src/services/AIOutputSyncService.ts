import type { AIOutputContent } from '../components/AIOutputPanel';

/**
 * Message types for AI Output synchronization
 */
export type SyncMessageType = 
  | 'content-update'
  | 'interaction-update'
  | 'sync-request'
  | 'sync-response'
  | 'error';

export interface SyncMessage {
  type: SyncMessageType;
  sessionId: string;
  userId: string;
  timestamp: number;
  data?: any;
}

export interface ContentUpdateMessage extends SyncMessage {
  type: 'content-update';
  data: {
    content: AIOutputContent;
  };
}

export interface InteractionUpdateMessage extends SyncMessage {
  type: 'interaction-update';
  data: {
    contentId: string;
    interactionState: {
      zoom?: number;
      pan?: { x: number; y: number };
      selectedElements?: string[];
    };
  };
}

/**
 * AIOutputSyncService manages WebSocket connections for real-time
 * synchronization of AI-generated content between tutor and tutees
 */
export class AIOutputSyncService {
  private ws: WebSocket | null = null;
  private sessionId: string | null = null;
  private userId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000; // Start with 2 seconds
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isReconnecting = false;
  private messageHandlers: Map<SyncMessageType, Set<(message: SyncMessage) => void>> = new Map();
  private onConnectionStateChange?: (connected: boolean) => void;

  /**
   * Connect to the WebSocket server
   */
  connect(
    sessionId: string,
    userId: string,
    onConnectionStateChange?: (connected: boolean) => void
  ): void {
    // Prevent multiple connections
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    this.sessionId = sessionId;
    this.userId = userId;
    this.onConnectionStateChange = onConnectionStateChange;

    try {
      // Construct WebSocket URL
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = import.meta.env.VITE_WS_HOST || window.location.host;
      const wsUrl = `${wsProtocol}//${wsHost}/ws/ai-output/${sessionId}`;

      console.log('Connecting to AI Output sync WebSocket:', wsUrl);
      this.ws = new WebSocket(wsUrl);

      // Set up event listeners
      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.handleReconnection();
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.isReconnecting = false;
    this.reconnectAttempts = 0;

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.onConnectionStateChange) {
      this.onConnectionStateChange(false);
    }

    console.log('Disconnected from AI Output sync WebSocket');
  }

  /**
   * Send a message through the WebSocket
   */
  send(message: SyncMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, cannot send message');
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
    }
  }

  /**
   * Broadcast content update to all connected users
   */
  broadcastContentUpdate(content: AIOutputContent): void {
    if (!this.sessionId || !this.userId) return;

    const message: ContentUpdateMessage = {
      type: 'content-update',
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
      data: { content },
    };

    this.send(message);
  }

  /**
   * Broadcast interaction state update (zoom, pan, selection)
   */
  broadcastInteractionUpdate(
    contentId: string,
    interactionState: {
      zoom?: number;
      pan?: { x: number; y: number };
      selectedElements?: string[];
    }
  ): void {
    if (!this.sessionId || !this.userId) return;

    const message: InteractionUpdateMessage = {
      type: 'interaction-update',
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
      data: { contentId, interactionState },
    };

    this.send(message);
  }

  /**
   * Request current sync state from the server
   */
  requestSyncState(): void {
    if (!this.sessionId || !this.userId) return;

    const message: SyncMessage = {
      type: 'sync-request',
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
    };

    this.send(message);
  }

  /**
   * Register a message handler for a specific message type
   */
  on(messageType: SyncMessageType, handler: (message: SyncMessage) => void): void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, new Set());
    }
    this.messageHandlers.get(messageType)!.add(handler);
  }

  /**
   * Unregister a message handler
   */
  off(messageType: SyncMessageType, handler: (message: SyncMessage) => void): void {
    const handlers = this.messageHandlers.get(messageType);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Set up WebSocket event listeners
   */
  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('AI Output sync WebSocket connected');
      this.reconnectAttempts = 0;
      this.reconnectDelay = 2000;
      this.isReconnecting = false;

      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(true);
      }

      // Request current sync state after connecting
      this.requestSyncState();
    };

    this.ws.onmessage = (event) => {
      try {
        const message: SyncMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(false);
      }

      // Attempt reconnection if not a normal closure
      if (event.code !== 1000 && !this.isReconnecting) {
        this.handleReconnection();
      }
    };
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: SyncMessage): void {
    // Ignore messages from self
    if (message.userId === this.userId) {
      return;
    }

    // Call registered handlers for this message type
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('Error in message handler:', error);
        }
      });
    }
  }

  /**
   * Handle reconnection logic with exponential backoff
   */
  private handleReconnection(): void {
    if (this.isReconnecting) {
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      if (this.sessionId && this.userId) {
        this.isReconnecting = false;
        this.connect(this.sessionId, this.userId, this.onConnectionStateChange);
      }
    }, delay);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.disconnect();
    this.messageHandlers.clear();
    this.onConnectionStateChange = undefined;
  }
}

// Export singleton instance
export const aiOutputSyncService = new AIOutputSyncService();
export default aiOutputSyncService;
