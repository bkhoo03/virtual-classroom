import * as AgoraToken from 'agora-access-token';
import { config } from '../config/env.js';

/**
 * Service for generating secure tokens for Agora services
 * API keys are never exposed to the frontend
 */
export class TokenService {
  /**
   * Generate Agora RTC token for video call
   */
  static generateAgoraToken(
    channelName: string,
    uid: number,
    role: 'publisher' | 'subscriber' = 'publisher'
  ): { token: string | null; uid: number; channelName: string; expiresAt: number } {
    if (!config.agoraAppId) {
      throw new Error('Agora App ID not configured');
    }

    // If no certificate is configured, return null token for development
    if (!config.agoraAppCertificate) {
      console.warn('AGORA_APP_CERTIFICATE not set. Using null token for development.');
      const expirationTimeInSeconds = 86400;
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

      return {
        token: null,
        uid,
        channelName,
        expiresAt: privilegeExpiredTs * 1000
      };
    }

    // Token expiration time (24 hours)
    const expirationTimeInSeconds = 86400;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // Convert role to Agora role (1 = publisher, 2 = subscriber)
    const agoraRole = role === 'publisher' ? 1 : 2;

    // Build the token using the default export
    const { RtcTokenBuilder } = AgoraToken;
    const token = RtcTokenBuilder.buildTokenWithUid(
      config.agoraAppId,
      config.agoraAppCertificate,
      channelName,
      uid,
      agoraRole,
      privilegeExpiredTs
    );

    return {
      token,
      uid,
      channelName,
      expiresAt: privilegeExpiredTs * 1000 // Convert to milliseconds
    };
  }

  /**
   * Generate Whiteboard token
   * Note: Actual implementation depends on Agora Whiteboard API
   */
  static generateWhiteboardToken(
    roomId: string,
    userId: string
  ): { roomToken: string; roomId: string; expiresAt: number } {
    if (!config.agoraWhiteboardAppId || !config.agoraWhiteboardAppSecret) {
      throw new Error('Whiteboard credentials not configured');
    }

    // For development, return a mock token
    // In production, this should call the Agora Whiteboard API
    const expirationTimeInSeconds = 86400;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // TODO: Implement actual Agora Whiteboard token generation
    // This is a placeholder implementation
    const roomToken = `whiteboard_token_${roomId}_${userId}_${Date.now()}`;

    return {
      roomToken,
      roomId,
      expiresAt: privilegeExpiredTs * 1000
    };
  }
}
