import * as AgoraToken from 'agora-access-token';
import * as crypto from 'crypto';
import { config } from '../config/env.js';

// In-memory cache for session -> whiteboard room mapping
// This ensures all users in the same session join the same whiteboard room
const sessionRoomCache = new Map<string, { roomUuid: string; createdAt: number }>();

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  for (const [sessionId, data] of sessionRoomCache.entries()) {
    if (now - data.createdAt > maxAge) {
      sessionRoomCache.delete(sessionId);
      console.log('Cleaned up old whiteboard room mapping for session:', sessionId);
    }
  }
}, 60 * 60 * 1000); // Run every hour

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
   * Generate Whiteboard SDK Token (for API authentication)
   * This token is used to authenticate with the Netless REST API
   * Format: NETLESSSDK_base64(query_string) where query_string = ak=...&nonce=...&role=...&sig=...
   */
  static generateWhiteboardSdkToken(
    role: 'admin' | 'writer' | 'reader' = 'admin',
    _lifespan: number = 3600000 // Not used for SDK tokens
  ): string {
    if (!config.agoraWhiteboardAK || !config.agoraWhiteboardSK) {
      throw new Error('Whiteboard AK/SK credentials not configured');
    }

    // Role mapping: 0 = admin, 1 = writer, 2 = reader
    const roleNum = role === 'admin' ? 0 : role === 'writer' ? 1 : 2;
    
    // Generate unique nonce
    const nonce = crypto.randomUUID();
    
    // Build the content map WITHOUT expireAt (SDK tokens don't expire)
    // Order: ak, nonce, role (alphabetically sorted)
    const contentMap: Record<string, string | number> = {
      ak: config.agoraWhiteboardAK,
      nonce: nonce,
      role: roleNum,
    };
    
    // Sort keys and build query string for signing
    const sortedKeys = Object.keys(contentMap).sort();
    const pairs: string[] = [];
    for (const key of sortedKeys) {
      pairs.push(`${key}=${contentMap[key]}`);
    }
    const signString = pairs.join('&');
    
    // Generate HMAC-SHA256 signature
    const sig = crypto
      .createHmac('sha256', config.agoraWhiteboardSK)
      .update(signString)
      .digest('hex');
    
    // Build final token as query string (NOT JSON!)
    const tokenString = `${signString}&sig=${sig}`;
    
    // Encode as base64 with prefix
    const token = 'NETLESSSDK_' + Buffer.from(tokenString).toString('base64');
    
    console.log('Generated SDK token for role:', role);
    console.log('Token string:', tokenString);
    return token;
  }

  /**
   * Generate a room UUID locally (deterministic based on session ID)
   * This avoids needing to call the Netless API to create rooms
   */
  static generateRoomUuid(sessionId: string): string {
    // Create a deterministic UUID from the session ID
    const hash = crypto.createHash('md5').update(sessionId).digest('hex');
    return hash; // 32 hex characters, matches Netless UUID format
  }

  /**
   * Generate a Room Token locally using the SDK token format
   * This token can be used to join a whiteboard room
   */
  static generateLocalRoomToken(
    roomUuid: string,
    role: 'admin' | 'writer' | 'reader' = 'admin',
    lifespan: number = 86400000 // 24 hours
  ): string {
    if (!config.agoraWhiteboardAK || !config.agoraWhiteboardSK) {
      throw new Error('Whiteboard AK/SK credentials not configured');
    }

    // Role mapping: 0 = admin, 1 = writer, 2 = reader
    const roleNum = role === 'admin' ? 0 : role === 'writer' ? 1 : 2;
    const nonce = crypto.randomUUID();
    const expireAt = Date.now() + lifespan;
    
    // Build content map with uuid for room token
    const contentMap: Record<string, string | number> = {
      ak: config.agoraWhiteboardAK,
      expireAt: expireAt,
      nonce: nonce,
      role: roleNum,
      uuid: roomUuid
    };
    
    // Sort keys and build query string for signing
    const sortedKeys = Object.keys(contentMap).sort();
    const pairs: string[] = [];
    for (const key of sortedKeys) {
      pairs.push(`${key}=${contentMap[key]}`);
    }
    const signString = pairs.join('&');
    
    // Generate HMAC-SHA256 signature
    const sig = crypto
      .createHmac('sha256', config.agoraWhiteboardSK)
      .update(signString)
      .digest('hex');
    
    // Build final token object
    const tokenObject = {
      ak: config.agoraWhiteboardAK,
      expireAt: expireAt,
      nonce: nonce,
      role: roleNum,
      sig: sig,
      uuid: roomUuid
    };
    
    // Encode as base64 with prefix
    const token = 'NETLESSROOM_' + Buffer.from(JSON.stringify(tokenObject)).toString('base64');
    
    console.log('Generated local room token for:', roomUuid);
    return token;
  }

  /**
   * Create a whiteboard room via Netless REST API
   * Returns the room UUID needed for joining
   */
  static async createWhiteboardRoom(): Promise<{ uuid: string; name: string }> {
    if (!config.agoraWhiteboardAK || !config.agoraWhiteboardSK) {
      throw new Error('Whiteboard AK/SK credentials not configured');
    }

    try {
      // Generate SDK token for API authentication
      const sdkToken = this.generateWhiteboardSdkToken('admin');
      
      // Call Netless REST API to create room
      const response = await fetch('https://api.netless.link/v5/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': sdkToken,
          'region': 'us-sv'
        },
        body: JSON.stringify({
          isRecord: false,
          limit: 0 // No limit on users
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Netless API error:', response.status, errorText);
        throw new Error(`Failed to create whiteboard room: ${response.status}`);
      }

      const data = await response.json() as { uuid: string; name?: string };
      console.log('Created whiteboard room:', data.uuid);
      
      return {
        uuid: data.uuid,
        name: data.name || 'Whiteboard Room'
      };
    } catch (error) {
      console.error('Error creating whiteboard room:', error);
      throw new Error('Failed to create whiteboard room');
    }
  }

  /**
   * Generate Whiteboard Room Token via Netless REST API
   * This token is required to join a specific room
   */
  static async generateWhiteboardRoomToken(
    roomUuid: string,
    role: 'admin' | 'writer' | 'reader' = 'admin',
    lifespan: number = 86400000 // 24 hours in milliseconds
  ): Promise<{ roomToken: string; roomId: string; expiresAt: number }> {
    if (!config.agoraWhiteboardAK || !config.agoraWhiteboardSK) {
      throw new Error('Whiteboard AK/SK credentials not configured');
    }

    try {
      // Generate SDK token for API authentication
      const sdkToken = this.generateWhiteboardSdkToken('admin');
      
      // Call Netless REST API to generate room token
      const response = await fetch(`https://api.netless.link/v5/tokens/rooms/${roomUuid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': sdkToken,
          'region': 'us-sv'
        },
        body: JSON.stringify({
          lifespan: lifespan,
          role: role
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Netless token API error:', response.status, errorText);
        throw new Error(`Failed to generate room token: ${response.status}`);
      }

      const roomToken = await response.text();
      const expiresAt = Date.now() + lifespan;
      
      console.log('Generated whiteboard room token for:', roomUuid);

      return {
        roomToken: roomToken.replace(/"/g, ''), // Remove quotes if present
        roomId: roomUuid,
        expiresAt
      };
    } catch (error) {
      console.error('Error generating whiteboard room token:', error);
      throw new Error('Failed to generate whiteboard room token');
    }
  }

  /**
   * Generate whiteboard token for a session
   * Uses the pre-generated SDK token from .env to create rooms and generate room tokens
   */
  static async generateWhiteboardToken(
    roomId: string,
    _userId: string,
    role: 'admin' | 'writer' | 'reader' = 'admin'
  ): Promise<{ roomToken: string; roomId: string; expiresAt: number; appId: string }> {
    if (!config.agoraWhiteboardAppId || !config.agoraWhiteboardSdkToken) {
      throw new Error('Whiteboard App ID or SDK Token not configured');
    }

    try {
      // Check if roomId is already a valid Agora-generated UUID (32 hex chars)
      const isValidUuid = /^[a-f0-9]{32}$/i.test(roomId);
      let roomUuid: string;
      
      if (isValidUuid) {
        // Already a valid UUID, use it directly
        roomUuid = roomId;
      } else {
        // This is a session ID, check if we already have a room for this session
        const cached = sessionRoomCache.get(roomId);
        
        if (cached) {
          // Use the existing room UUID for this session
          roomUuid = cached.roomUuid;
          console.log('Using cached room UUID for session:', roomId, '->', roomUuid);
        } else {
          // Create a new room for this session
          const sdkToken = config.agoraWhiteboardSdkToken;
          
          const createResponse = await fetch('https://api.netless.link/v5/rooms', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'token': sdkToken,
              'region': 'us-sv'
            },
            body: JSON.stringify({
              isRecord: false,
              limit: 0
            })
          });

          if (!createResponse.ok) {
            const errorText = await createResponse.text();
            console.error('Failed to create whiteboard room:', createResponse.status, errorText);
            throw new Error(`Failed to create whiteboard room: ${createResponse.status}`);
          }

          const roomData = await createResponse.json() as { uuid: string };
          roomUuid = roomData.uuid;
          
          // Cache the room UUID for this session
          sessionRoomCache.set(roomId, {
            roomUuid: roomUuid,
            createdAt: Date.now()
          });
          
          console.log('Created and cached new whiteboard room for session:', roomId, '->', roomUuid);
        }
      }

      // Use the pre-generated SDK token from .env
      const sdkToken = config.agoraWhiteboardSdkToken;
      console.log('Using pre-generated SDK token from Agora Console');

      // Generate room token using the Netless API
      const lifespan = 86400000; // 24 hours
      const tokenResponse = await fetch(`https://api.netless.link/v5/tokens/rooms/${roomUuid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': sdkToken,
          'region': 'us-sv'
        },
        body: JSON.stringify({
          lifespan: lifespan,
          role: role
        })
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Failed to generate room token:', tokenResponse.status, errorText);
        throw new Error(`Failed to generate room token: ${tokenResponse.status}`);
      }

      const roomToken = await tokenResponse.text();
      const expiresAt = Date.now() + lifespan;
      
      console.log('Successfully generated room token for:', roomUuid);
      
      return {
        roomToken: roomToken.replace(/"/g, ''), // Remove quotes if present
        roomId: roomUuid,
        expiresAt: expiresAt,
        appId: config.agoraWhiteboardAppId
      };
    } catch (error) {
      console.error('Error generating whiteboard token:', error);
      throw error;
    }
  }
}
