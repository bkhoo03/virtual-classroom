import express from 'express';
import { TokenService } from '../services/tokenService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/tokens/agora
 * Generate Agora RTC token for video call
 */
router.post('/agora', authenticateToken, (req, res) => {
  try {
    const { sessionId, channelName, role } = req.body;

    if (!channelName) {
      res.status(400).json({ message: 'Channel name is required' });
      return;
    }

    // Generate a unique UID for this user
    const uid = Math.floor(Math.random() * 1000000);

    const tokenData = TokenService.generateAgoraToken(
      channelName,
      uid,
      role || 'publisher'
    );

    res.json(tokenData);
  } catch (error) {
    console.error('Agora token generation error:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to generate Agora token' 
    });
  }
});

/**
 * POST /api/tokens/whiteboard
 * Generate Whiteboard token
 * Note: Authentication temporarily disabled for development
 */
router.post('/whiteboard', async (req, res) => {
  try {
    const { sessionId, roomId, role } = req.body;

    if (!roomId) {
      res.status(400).json({ message: 'Room ID is required' });
      return;
    }

    // Use a default userId for development (normally from req.user)
    const userId = 'dev-user-' + Date.now();
    
    // Validate role if provided
    const validRoles = ['admin', 'writer', 'reader'];
    const userRole = role && validRoles.includes(role) ? role : 'admin';

    const tokenData = await TokenService.generateWhiteboardToken(roomId, userId, userRole);

    // Return with 'token' field for consistency
    res.json({
      token: tokenData.roomToken,
      roomId: tokenData.roomId,
      expiresAt: tokenData.expiresAt
    });
  } catch (error) {
    console.error('Whiteboard token generation error:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to generate whiteboard token' 
    });
  }
});

export default router;
