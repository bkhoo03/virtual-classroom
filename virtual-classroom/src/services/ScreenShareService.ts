import AgoraRTC from 'agora-rtc-sdk-ng';
import type {
  IAgoraRTCClient,
  ILocalVideoTrack,
} from 'agora-rtc-sdk-ng';

export class ScreenShareService {
  private client: IAgoraRTCClient | null = null;
  private screenTrack: ILocalVideoTrack | null = null;
  private isSharing = false;

  constructor() {
    // Create a separate client for screen sharing
    this.client = AgoraRTC.createClient({
      mode: 'rtc',
      codec: 'vp8'
    });
  }

  /**
   * Start screen sharing
   */
  async startScreenShare(
    appId: string,
    channel: string,
    token: string,
    uid: number
  ): Promise<ILocalVideoTrack> {
    if (this.isSharing) {
      throw new Error('Screen sharing is already active');
    }

    try {
      // Join the channel with screen share client
      await this.client!.join(appId, channel, token, uid);

      // Create screen video track
      const screenTrackResult = await AgoraRTC.createScreenVideoTrack(
        {
          encoderConfig: {
            width: 1920,
            height: 1080,
            frameRate: 15,
            bitrateMin: 600,
            bitrateMax: 2000
          },
          optimizationMode: 'detail' // Better for presentations
        },
        'auto' // Automatically handle screen sharing permissions
      );

      // Handle both single track and array of tracks
      if (Array.isArray(screenTrackResult)) {
        this.screenTrack = screenTrackResult[0];
      } else {
        this.screenTrack = screenTrackResult;
      }

      // Publish the screen track
      await this.client!.publish(this.screenTrack);

      this.isSharing = true;
      console.log('Screen sharing started successfully');

      // Listen for track ended event (user stops sharing via browser UI)
      this.screenTrack.on('track-ended', () => {
        console.log('Screen sharing stopped by user');
        this.stopScreenShare();
      });

      return this.screenTrack;
    } catch (error) {
      console.error('Failed to start screen sharing:', error);
      await this.cleanup();
      throw error;
    }
  }

  /**
   * Stop screen sharing
   */
  async stopScreenShare(): Promise<void> {
    if (!this.isSharing) {
      return;
    }

    try {
      // Unpublish and close the screen track
      if (this.screenTrack && this.client) {
        await this.client.unpublish(this.screenTrack);
        this.screenTrack.stop();
        this.screenTrack.close();
        this.screenTrack = null;
      }

      // Leave the channel
      if (this.client) {
        await this.client.leave();
      }

      this.isSharing = false;
      console.log('Screen sharing stopped');
    } catch (error) {
      console.error('Error stopping screen sharing:', error);
      throw error;
    }
  }

  /**
   * Check if currently sharing
   */
  getIsSharing(): boolean {
    return this.isSharing;
  }

  /**
   * Get the screen track
   */
  getScreenTrack(): ILocalVideoTrack | null {
    return this.screenTrack;
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    try {
      if (this.screenTrack) {
        this.screenTrack.stop();
        this.screenTrack.close();
        this.screenTrack = null;
      }

      if (this.client) {
        await this.client.leave();
        this.client.removeAllListeners();
      }

      this.isSharing = false;
      console.log('Screen share service cleaned up');
    } catch (error) {
      console.error('Error during screen share cleanup:', error);
    }
  }
}
