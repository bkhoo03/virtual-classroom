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
import errorLoggingService from './ErrorLoggingService';

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
   * Includes retry logic and improved error handling
   */
  async initialize(
    config: VideoCallConfig,
    onReconnectStateChange?: (isReconnecting: boolean, attempt: number) => void
  ): Promise<void> {
    // Validate configuration
    if (!config.appId) {
      throw new Error('Agora App ID is required');
    }
    if (!config.channel) {
      throw new Error('Channel name is required');
    }

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

    // Retry logic for initialization
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempting to join channel (attempt ${attempt}/${maxRetries})...`);
        
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
        
        return; // Success!
      } catch (error: any) {
        lastError = error;
        
        // If already connected, don't treat as error
        if (error?.code === 'INVALID_OPERATION' && error?.message?.includes('already in connecting/connected state')) {
          console.log('Already connected, initialization complete');
          return;
        }

        // Log the error with context
        errorLoggingService.logSDKError(
          error,
          'Agora RTC',
          {
            component: 'VideoCallService',
            action: 'initialize',
            additionalData: {
              attempt,
              maxRetries,
              channel: config.channel,
              errorCode: error?.code,
            },
          }
        );

        // If this is not the last attempt, wait before retrying
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed, throw a user-friendly error
    const errorMessage = this.getUserFriendlyError(lastError);
    const finalError = new Error(errorMessage);
    
    // Log the final failure
    errorLoggingService.logSDKError(
      finalError,
      'Agora RTC',
      {
        component: 'VideoCallService',
        action: 'initialize_final_failure',
        additionalData: {
          channel: config.channel,
          originalError: lastError?.message,
        },
      }
    );
    
    throw finalError;
  }

  /**
   * Convert technical errors to user-friendly messages
   */
  private getUserFriendlyError(error: any): string {
    if (!error) return 'Failed to connect to video service';

    const errorCode = error.code;
    const errorMessage = error.message || '';

    // Map common Agora error codes to user-friendly messages
    switch (errorCode) {
      case 'INVALID_PARAMS':
        return 'Invalid configuration. Please contact support.';
      case 'NOT_SUPPORTED':
        return 'Your browser does not support video calls. Please use a modern browser like Chrome, Firefox, or Safari.';
      case 'INVALID_OPERATION':
        return 'Connection error. Please refresh the page and try again.';
      case 'OPERATION_ABORTED':
        return 'Connection was interrupted. Please try again.';
      case 'WEB_SECURITY_RESTRICT':
        return 'Browser security settings are blocking the connection. Please check your browser settings.';
      case 'NETWORK_ERROR':
        return 'Network connection failed. Please check your internet connection and try again.';
      case 'NETWORK_TIMEOUT':
        return 'Connection timed out. Please check your internet connection and try again.';
      case 'NETWORK_RESPONSE_ERROR':
        return 'Server connection failed. Please try again later.';
      default:
        // Check for common error patterns in message
        if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
          return 'Network connection issue. Please check your internet connection.';
        }
        if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
          return 'Permission denied. Please check your browser settings.';
        }
        return `Connection failed: ${errorMessage || 'Unknown error'}`;
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
    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Generating token (attempt ${attempt}/${maxRetries})...`);
        
        const response = await apiClient.post<AgoraTokenResponse>(
          '/api/tokens/agora',
          {
            channelName: channel,
            role
          }
        );

        console.log('Token generated successfully');
        return response.data;
      } catch (error: any) {
        lastError = error;
        console.error(`Token generation failed (attempt ${attempt}/${maxRetries}):`, error);

        // If this is not the last attempt, wait before retrying
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * attempt, 3000); // Linear backoff, max 3s
          console.log(`Retrying token generation in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    console.error('All token generation attempts failed');
    
    // For development, return a mock response if backend is not available
    if (import.meta.env.VITE_ENV === 'development' || import.meta.env.DEV) {
      console.warn('Using null token for development');
      return {
        token: null as any,
        uid: Math.floor(Math.random() * 1000000),
        channel,
        expiresAt: Date.now() + 3600000
      };
    }

    // Throw user-friendly error
    const errorMessage = lastError?.response?.data?.message || lastError?.message || 'Failed to generate authentication token';
    throw new Error(`Token generation failed: ${errorMessage}. Please try again or contact support.`);
  }

  /**
   * Create and publish local video and audio tracks
   * Handles permission errors and missing devices gracefully
   */
  async createLocalTracks(): Promise<VideoStream> {
    let audioTrack: ILocalAudioTrack | null = null;
    let videoTrack: ILocalVideoTrack | null = null;
    let hasAudio = false;
    let hasVideo = false;

    try {
      // Try to create both audio and video tracks
      console.log('Creating local audio and video tracks...');
      [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
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
      
      this.localAudioTrack = audioTrack;
      this.localVideoTrack = videoTrack;
      hasAudio = true;
      hasVideo = true;
      
      // Ensure tracks are enabled by default
      if (audioTrack) {
        await audioTrack.setEnabled(true);
      }
      if (videoTrack) {
        await videoTrack.setEnabled(true);
      }
      
      console.log('Successfully created audio and video tracks');
      console.log('Audio track enabled:', audioTrack?.enabled);
      console.log('Video track enabled:', videoTrack?.enabled);
    } catch (error: any) {
      console.error('Failed to create both tracks:', error);
      
      // Try to create tracks separately to identify which one failed
      try {
        console.log('Attempting to create audio track only...');
        audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
          encoderConfig: 'high_quality_stereo'
        });
        this.localAudioTrack = audioTrack;
        hasAudio = true;
        await audioTrack.setEnabled(true);
        console.log('Successfully created audio track, enabled:', audioTrack.enabled);
      } catch (audioError: any) {
        console.error('Failed to create audio track:', audioError);
        const audioErrorMsg = this.getMediaDeviceError(audioError, 'microphone');
        console.warn(audioErrorMsg);
      }

      try {
        console.log('Attempting to create video track only...');
        videoTrack = await AgoraRTC.createCameraVideoTrack({
          encoderConfig: {
            width: 640,
            height: 480,
            frameRate: 30,
            bitrateMin: 400,
            bitrateMax: 1000
          }
        });
        this.localVideoTrack = videoTrack;
        hasVideo = true;
        await videoTrack.setEnabled(true);
        console.log('Successfully created video track, enabled:', videoTrack.enabled);
      } catch (videoError: any) {
        console.error('Failed to create video track:', videoError);
        const videoErrorMsg = this.getMediaDeviceError(videoError, 'camera');
        console.warn(videoErrorMsg);
      }

      // If neither track was created, throw an error
      if (!hasAudio && !hasVideo) {
        const originalError = error?.message || 'Unknown error';
        throw new Error(`Failed to access both camera and microphone: ${originalError}. Please check your device permissions and ensure devices are connected.`);
      }
      
      // Log warning if only one track was created
      if (!hasAudio) {
        console.warn('Continuing without audio track');
      }
      if (!hasVideo) {
        console.warn('Continuing without video track');
      }
    }

    // Wait for client to be fully connected before publishing
    if (this.client) {
      const connectionState = this.client.connectionState;
      console.log('Current connection state before publishing:', connectionState);
      
      // If not connected yet, wait for connection
      if (connectionState !== 'CONNECTED') {
        console.log('Waiting for client to connect before publishing tracks...');
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout waiting for connection'));
          }, 10000); // 10 second timeout

          const checkConnection = () => {
            if (this.client?.connectionState === 'CONNECTED') {
              clearTimeout(timeout);
              console.log('Client connected, ready to publish');
              resolve();
            } else {
              setTimeout(checkConnection, 100);
            }
          };
          checkConnection();
        });
      }

      // Publish available tracks to the channel
      try {
        const tracksToPublish = [];
        if (this.localAudioTrack) tracksToPublish.push(this.localAudioTrack);
        if (this.localVideoTrack) tracksToPublish.push(this.localVideoTrack);
        
        if (tracksToPublish.length > 0) {
          console.log(`Publishing ${tracksToPublish.length} track(s)...`);
          console.log('Tracks to publish:', {
            audio: this.localAudioTrack ? 'present' : 'missing',
            video: this.localVideoTrack ? 'present' : 'missing',
            audioEnabled: this.localAudioTrack?.enabled,
            videoEnabled: this.localVideoTrack?.enabled
          });
          await this.client.publish(tracksToPublish);
          console.log(`✅ Published ${tracksToPublish.length} track(s) successfully`);
        }
      } catch (error: any) {
        console.error('Failed to publish tracks:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          name: error.name
        });
        // Don't throw - allow the app to continue even if publishing fails
        // The user can still see their local preview
        console.warn('Continuing without publishing tracks. Local preview should still work.');
      }
    }

    return {
      userId: this.config?.userId || 'local',
      streamId: 'local',
      videoTrack: this.localVideoTrack,
      audioTrack: this.localAudioTrack,
      isLocal: true
    };
  }

  /**
   * Get user-friendly error message for media device errors
   */
  private getMediaDeviceError(error: any, deviceType: 'camera' | 'microphone'): string {
    const errorName = error.name || '';
    const errorMessage = error.message || '';

    // Permission denied
    if (errorName === 'NotAllowedError' || errorMessage.includes('Permission denied')) {
      return `${deviceType === 'camera' ? 'Camera' : 'Microphone'} access denied. Please grant permission in your browser settings.`;
    }

    // Device not found
    if (errorName === 'NotFoundError' || errorMessage.includes('not found')) {
      return `No ${deviceType} found. Please connect a ${deviceType} and try again.`;
    }

    // Device in use
    if (errorName === 'NotReadableError' || errorMessage.includes('in use')) {
      return `${deviceType === 'camera' ? 'Camera' : 'Microphone'} is already in use by another application. Please close other applications and try again.`;
    }

    // Overconstrained (settings not supported)
    if (errorName === 'OverconstrainedError') {
      return `${deviceType === 'camera' ? 'Camera' : 'Microphone'} settings not supported. Using default settings.`;
    }

    // Generic error
    return `Failed to access ${deviceType}: ${errorMessage || 'Unknown error'}`;
  }

  /**
   * Subscribe to remote user's tracks
   * Automatically handles user join/leave events
   */
  async subscribeToRemoteUser(uid: UID): Promise<VideoStream | null> {
    if (!this.client) {
      console.error('Cannot subscribe: client not initialized');
      return null;
    }

    try {
      const remoteUser = this.client.remoteUsers.find(user => user.uid === uid);
      if (!remoteUser) {
        console.warn(`Remote user ${uid} not found`);
        return null;
      }

      console.log(`Subscribing to remote user ${uid}...`);

      // Subscribe to video track if available
      if (remoteUser.hasVideo) {
        try {
          await this.client.subscribe(remoteUser, 'video');
          console.log(`Subscribed to video track for user ${uid}`);
        } catch (error) {
          console.error(`Failed to subscribe to video for user ${uid}:`, error);
        }
      }

      // Subscribe to audio track if available
      if (remoteUser.hasAudio) {
        try {
          await this.client.subscribe(remoteUser, 'audio');
          console.log(`Subscribed to audio track for user ${uid}`);
        } catch (error) {
          console.error(`Failed to subscribe to audio for user ${uid}:`, error);
        }
      }

      return {
        userId: String(uid),
        streamId: String(uid),
        videoTrack: remoteUser.videoTrack || null,
        audioTrack: remoteUser.audioTrack || null,
        isLocal: false
      };
    } catch (error) {
      console.error(`Failed to subscribe to remote user ${uid}:`, error);
      return null;
    }
  }

  /**
   * Unsubscribe from remote user's tracks
   * Called when user leaves or unpublishes
   */
  async unsubscribeFromRemoteUser(uid: UID): Promise<void> {
    if (!this.client) return;

    try {
      const remoteUser = this.client.remoteUsers.find(user => user.uid === uid);
      if (!remoteUser) return;

      console.log(`Unsubscribing from remote user ${uid}...`);

      // Unsubscribe from video track
      if (remoteUser.hasVideo) {
        try {
          await this.client.unsubscribe(remoteUser, 'video');
          console.log(`Unsubscribed from video track for user ${uid}`);
        } catch (error) {
          console.error(`Failed to unsubscribe from video for user ${uid}:`, error);
        }
      }

      // Unsubscribe from audio track
      if (remoteUser.hasAudio) {
        try {
          await this.client.unsubscribe(remoteUser, 'audio');
          console.log(`Unsubscribed from audio track for user ${uid}`);
        } catch (error) {
          console.error(`Failed to unsubscribe from audio for user ${uid}:`, error);
        }
      }
    } catch (error) {
      console.error(`Failed to unsubscribe from remote user ${uid}:`, error);
    }
  }

  /**
   * Toggle local audio mute state
   */
  async toggleAudio(muted: boolean): Promise<void> {
    if (this.localAudioTrack) {
      await this.localAudioTrack.setEnabled(!muted);
      console.log(`Audio ${muted ? 'muted' : 'unmuted'}`);
    } else {
      console.warn('Cannot toggle audio: no audio track available');
    }
  }

  /**
   * Toggle local video on/off state
   */
  async toggleVideo(enabled: boolean): Promise<void> {
    if (this.localVideoTrack) {
      await this.localVideoTrack.setEnabled(enabled);
      console.log(`Video ${enabled ? 'enabled' : 'disabled'}`);
    } else {
      console.warn('Cannot toggle video: no video track available');
    }
  }

  /**
   * Get current audio mute state
   */
  isAudioMuted(): boolean {
    if (!this.localAudioTrack) return true;
    return !this.localAudioTrack.enabled;
  }

  /**
   * Get current video enabled state
   */
  isVideoEnabled(): boolean {
    if (!this.localVideoTrack) return false;
    return this.localVideoTrack.enabled;
  }

  /**
   * Get current media state
   */
  getMediaState(): { audioMuted: boolean; videoEnabled: boolean } {
    return {
      audioMuted: this.isAudioMuted(),
      videoEnabled: this.isVideoEnabled()
    };
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

    // User published event - automatically subscribe to new tracks
    this.client.on('user-published', async (user, mediaType) => {
      console.log('User published:', user.uid, mediaType);
      await this.subscribeToRemoteUser(user.uid);
    });

    // User unpublished event - cleanup when user stops publishing
    this.client.on('user-unpublished', async (user, mediaType) => {
      console.log('User unpublished:', user.uid, mediaType);
      // Note: Agora SDK automatically handles unsubscription when user unpublishes
      // We just log it for debugging
    });

    // User joined event
    this.client.on('user-joined', (user) => {
      console.log('User joined:', user.uid);
    });

    // User left event - cleanup remote streams
    this.client.on('user-left', async (user, reason) => {
      console.log('User left:', user.uid, 'Reason:', reason);
      // Cleanup is handled automatically by Agora SDK
      // Remote tracks are removed from remoteUsers array
    });

    // Connection state change
    this.client.on('connection-state-change', (curState, prevState, reason) => {
      console.log('Connection state changed:', prevState, '->', curState, 'Reason:', reason);
      
      if (curState === 'DISCONNECTED' || curState === 'DISCONNECTING') {
        this.handleDisconnection();
      } else if (curState === 'CONNECTED' && prevState === 'RECONNECTING') {
        console.log('Reconnected successfully');
      }
    });

    // Network quality
    this.client.on('network-quality', (stats) => {
      // Only log if quality is poor
      if (stats.downlinkNetworkQuality > 3 || stats.uplinkNetworkQuality > 3) {
        console.warn('Network quality degraded:', stats);
      }
    });

    // Exception event
    this.client.on('exception', (event) => {
      console.error('Agora exception:', event);
    });

    // Token privilege will expire event
    this.client.on('token-privilege-will-expire', async () => {
      console.warn('Token will expire soon, should renew token');
      // TODO: Implement token renewal
    });

    // Token privilege did expire event
    this.client.on('token-privilege-did-expire', async () => {
      console.error('Token expired, need to rejoin with new token');
      // TODO: Implement automatic token renewal and rejoin
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
