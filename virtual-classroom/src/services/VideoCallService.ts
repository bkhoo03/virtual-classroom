import AgoraRTC from 'agora-rtc-sdk-ng';
import type {
  IAgoraRTCClient,
  ILocalVideoTrack,
  ILocalAudioTrack,
  UID
} from 'agora-rtc-sdk-ng';
import { apiClient } from '../utils/apiClient';
import type { VideoCallConfig, AgoraTokenResponse, VideoStream } from '../types/video.types';
import type { ConnectionQuality } from '../types';

export class VideoCallService {
  private client: IAgoraRTCClient | null = null;
  private localVideoTrack: ILocalVideoTrack | null = null;
  private localAudioTrack: ILocalAudioTrack | null = null;
  private config: VideoCallConfig | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectTimeout = 60000; // 60 seconds
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isReconnecting = false;
  private onReconnectStateChange?: (isReconnecting: boolean, attempt: number) => void;

  constructor() {
    // Initialize Agora client with optimized settings
    this.client = AgoraRTC.createClient({
      mode: 'rtc',
      codec: 'vp8'
    });
  }

  /**
   * Initialize the video call service with configuration
   */
  async initialize(
    config: VideoCallConfig,
    onReconnectStateChange?: (isReconnecting: boolean, attempt: number) => void
  ): Promise<void> {
    // Recreate client if it was cleaned up
    if (!this.client) {
      this.client = AgoraRTC.createClient({
        mode: 'rtc',
        codec: 'vp8'
      });
    }

    // Check if already connected or connecting to the same channel
    const connectionState = this.client.connectionState;
    if ((connectionState === 'CONNECTED' || connectionState === 'CONNECTING') && 
        this.config?.channel === config.channel) {
      console.log('Already connected or connecting to this channel, skipping initialization');
      return;
    }

    this.config = config;
    this.onReconnectStateChange = onReconnectStateChange;

    // Set up event listeners
    this.setupEventListeners();

    try {
      // Join the channel
      await this.client.join(
        config.appId,
        config.channel,
        config.token,
        config.uid
      );

      console.log('Successfully joined Agora channel:', config.channel);
      
      // Reset reconnection state on successful connection
      this.reconnectAttempts = 0;
      this.isReconnecting = false;
      if (this.onReconnectStateChange) {
        this.onReconnectStateChange(false, 0);
      }
    } catch (error: any) {
      // If already connected, don't treat as error
      if (error?.code === 'INVALID_OPERATION' && error?.message?.includes('already in connecting/connected state')) {
        console.log('Already connected, initialization complete');
        return;
      }
      console.error('Failed to join channel:', error);
      throw error;
    }
  }

  /**
   * Generate Agora RTC token from backend
   * Note: This method is kept for backward compatibility but should use SessionSecurityService
   */
  async generateToken(
    channel: string,
    userId: string,
    role: 'publisher' | 'subscriber' = 'publisher'
  ): Promise<AgoraTokenResponse> {
    try {
      const response = await apiClient.post<AgoraTokenResponse>(
        '/api/tokens/agora',
        {
          channelName: channel,
          role
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to generate token:', error);
      // For development, return a mock response if backend is not available
      if (import.meta.env.VITE_ENV === 'development') {
        console.warn('Using null token for development');
        return {
          token: null as any,
          uid: Math.floor(Math.random() * 1000000),
          channel,
          expiresAt: Date.now() + 3600000
        };
      }
      throw error;
    }
  }

  /**
   * Create and publish local video and audio tracks
   */
  async createLocalTracks(): Promise<VideoStream> {
    try {
      // Create local tracks
      [this.localAudioTrack, this.localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
        {
          encoderConfig: 'high_quality_stereo'
        },
        {
          encoderConfig: {
            width: 640,
            height: 480,
            frameRate: 30,
            bitrateMin: 400,
            bitrateMax: 1000
          }
        }
      );

      // Publish tracks to the channel
      if (this.client) {
        await this.client.publish([this.localAudioTrack, this.localVideoTrack]);
        console.log('Local tracks published successfully');
      }

      return {
        userId: this.config?.userId || 'local',
        streamId: 'local',
        videoTrack: this.localVideoTrack,
        audioTrack: this.localAudioTrack,
        isLocal: true
      };
    } catch (error) {
      console.error('Failed to create local tracks:', error);
      throw error;
    }
  }

  /**
   * Subscribe to remote user's tracks
   */
  async subscribeToRemoteUser(uid: UID): Promise<VideoStream | null> {
    if (!this.client) return null;

    try {
      const remoteUser = this.client.remoteUsers.find(user => user.uid === uid);
      if (!remoteUser) return null;

      // Subscribe to video and audio tracks
      if (remoteUser.hasVideo && remoteUser.videoTrack) {
        await this.client.subscribe(remoteUser, 'video');
      }
      if (remoteUser.hasAudio && remoteUser.audioTrack) {
        await this.client.subscribe(remoteUser, 'audio');
      }

      return {
        userId: String(uid),
        streamId: String(uid),
        videoTrack: remoteUser.videoTrack || null,
        audioTrack: remoteUser.audioTrack || null,
        isLocal: false
      };
    } catch (error) {
      console.error('Failed to subscribe to remote user:', error);
      return null;
    }
  }

  /**
   * Toggle local audio mute state
   */
  async toggleAudio(muted: boolean): Promise<void> {
    if (this.localAudioTrack) {
      await this.localAudioTrack.setEnabled(!muted);
    }
  }

  /**
   * Toggle local video on/off state
   */
  async toggleVideo(enabled: boolean): Promise<void> {
    if (this.localVideoTrack) {
      await this.localVideoTrack.setEnabled(enabled);
    }
  }

  /**
   * Get network quality
   */
  getNetworkQuality(): ConnectionQuality {
    if (!this.client) return 'bad';

    try {
      const stats = this.client.getRTCStats();
      const recvBitrate = stats.RecvBitrate || 0;
      const sendBitrate = stats.SendBitrate || 0;
      
      // Calculate average bitrate
      const avgBitrate = (recvBitrate + sendBitrate) / 2;

      // Determine quality based on bitrate
      if (avgBitrate > 800) return 'excellent';
      if (avgBitrate > 400) return 'good';
      if (avgBitrate > 150) return 'poor';
      return 'bad';
    } catch (error) {
      console.error('Error getting network quality:', error);
      return 'good'; // Default to good if we can't determine
    }
  }

  /**
   * Adjust video quality based on network conditions
   */
  async adjustVideoQuality(quality: ConnectionQuality): Promise<void> {
    if (!this.localVideoTrack) return;

    try {
      switch (quality) {
        case 'excellent':
          // High quality
          await this.localVideoTrack.setEncoderConfiguration({
            width: 640,
            height: 480,
            frameRate: 30,
            bitrateMin: 400,
            bitrateMax: 1000
          });
          break;
        case 'good':
          // Medium quality
          await this.localVideoTrack.setEncoderConfiguration({
            width: 480,
            height: 360,
            frameRate: 24,
            bitrateMin: 300,
            bitrateMax: 600
          });
          break;
        case 'poor':
          // Low quality
          await this.localVideoTrack.setEncoderConfiguration({
            width: 320,
            height: 240,
            frameRate: 15,
            bitrateMin: 150,
            bitrateMax: 400
          });
          break;
        case 'bad':
          // Very low quality
          await this.localVideoTrack.setEncoderConfiguration({
            width: 160,
            height: 120,
            frameRate: 10,
            bitrateMin: 100,
            bitrateMax: 200
          });
          break;
      }
      console.log(`Video quality adjusted to: ${quality}`);
    } catch (error) {
      console.error('Error adjusting video quality:', error);
    }
  }

  /**
   * Set up event listeners for the Agora client
   */
  private setupEventListeners(): void {
    if (!this.client) return;

    // User published event
    this.client.on('user-published', async (user, mediaType) => {
      console.log('User published:', user.uid, mediaType);
      await this.subscribeToRemoteUser(user.uid);
    });

    // User unpublished event
    this.client.on('user-unpublished', (user, mediaType) => {
      console.log('User unpublished:', user.uid, mediaType);
    });

    // User joined event
    this.client.on('user-joined', (user) => {
      console.log('User joined:', user.uid);
    });

    // User left event
    this.client.on('user-left', (user, reason) => {
      console.log('User left:', user.uid, reason);
    });

    // Connection state change
    this.client.on('connection-state-change', (curState, prevState, reason) => {
      console.log('Connection state changed:', prevState, '->', curState, 'Reason:', reason);
      
      if (curState === 'DISCONNECTED' || curState === 'DISCONNECTING') {
        this.handleDisconnection();
      }
    });

    // Network quality
    this.client.on('network-quality', (stats) => {
      console.log('Network quality:', stats);
    });

    // Exception event
    this.client.on('exception', (event) => {
      console.error('Agora exception:', event);
    });
  }

  /**
   * Handle disconnection and attempt reconnection
   */
  private async handleDisconnection(): Promise<void> {
    // Prevent multiple simultaneous reconnection attempts
    if (this.isReconnecting) {
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.isReconnecting = false;
      if (this.onReconnectStateChange) {
        this.onReconnectStateChange(false, this.reconnectAttempts);
      }
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;
    
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    if (this.onReconnectStateChange) {
      this.onReconnectStateChange(true, this.reconnectAttempts);
    }

    // Set timeout for max reconnection duration (60 seconds)
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    this.reconnectTimer = setTimeout(() => {
      if (this.isReconnecting) {
        console.log('Reconnection timeout reached');
        this.reconnectAttempts = this.maxReconnectAttempts;
        this.handleDisconnection();
      }
    }, this.reconnectTimeout);

    try {
      if (this.config && this.client) {
        // Check if already connected or connecting
        const connectionState = this.client.connectionState;
        if (connectionState === 'CONNECTED' || connectionState === 'CONNECTING') {
          console.log('Already connected or connecting, skipping reconnection');
          this.reconnectAttempts = 0;
          this.isReconnecting = false;
          
          if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
          }
          
          if (this.onReconnectStateChange) {
            this.onReconnectStateChange(false, 0);
          }
          return;
        }

        // Try to rejoin the channel
        await this.client.join(
          this.config.appId,
          this.config.channel,
          this.config.token,
          this.config.uid
        );

        // Republish local tracks if they exist
        if (this.localAudioTrack && this.localVideoTrack) {
          await this.client.publish([this.localAudioTrack, this.localVideoTrack]);
        }

        console.log('Reconnection successful');
        this.reconnectAttempts = 0;
        this.isReconnecting = false;
        
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
        
        if (this.onReconnectStateChange) {
          this.onReconnectStateChange(false, 0);
        }
      }
    } catch (error: any) {
      console.error('Reconnection failed:', error);
      
      // If already connected, treat as success
      if (error?.code === 'INVALID_OPERATION' && error?.message?.includes('already in connecting/connected state')) {
        console.log('Already connected, treating as successful reconnection');
        this.reconnectAttempts = 0;
        this.isReconnecting = false;
        
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
        
        if (this.onReconnectStateChange) {
          this.onReconnectStateChange(false, 0);
        }
        return;
      }
      
      // Retry after a delay if we haven't exceeded max attempts
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.isReconnecting = false;
          this.handleDisconnection();
        }, 5000);
      } else {
        this.isReconnecting = false;
        if (this.onReconnectStateChange) {
          this.onReconnectStateChange(false, this.reconnectAttempts);
        }
      }
    }
  }

  /**
   * Manually trigger reconnection
   */
  async manualReconnect(): Promise<void> {
    console.log('Manual reconnection triggered');
    this.reconnectAttempts = 0;
    this.isReconnecting = false;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    await this.handleDisconnection();
  }

  /**
   * Get current reconnection state
   */
  getReconnectionState(): { isReconnecting: boolean; attempts: number; maxAttempts: number } {
    return {
      isReconnecting: this.isReconnecting,
      attempts: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts
    };
  }

  /**
   * Clean up and leave the channel
   */
  async cleanup(): Promise<void> {
    try {
      // Clear reconnection timer
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      // Reset reconnection state
      this.isReconnecting = false;
      this.reconnectAttempts = 0;

      // Stop and close local tracks
      if (this.localVideoTrack) {
        this.localVideoTrack.stop();
        this.localVideoTrack.close();
        this.localVideoTrack = null;
      }

      if (this.localAudioTrack) {
        this.localAudioTrack.stop();
        this.localAudioTrack.close();
        this.localAudioTrack = null;
      }

      // Leave the channel
      if (this.client) {
        await this.client.leave();
        this.client.removeAllListeners();
        this.client = null;
      }

      console.log('Video call service cleaned up');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  /**
   * Get the Agora client instance
   */
  getClient(): IAgoraRTCClient | null {
    return this.client;
  }

  /**
   * Get local video track
   */
  getLocalVideoTrack(): ILocalVideoTrack | null {
    return this.localVideoTrack;
  }

  /**
   * Get local audio track
   */
  getLocalAudioTrack(): ILocalAudioTrack | null {
    return this.localAudioTrack;
  }
}
