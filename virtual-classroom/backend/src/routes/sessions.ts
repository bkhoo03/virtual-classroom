import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Mock session storage (replace with database in production)
const sessions = new Map<string, any>();

/**
 * POST /api/sessions
 * Create a new session
 */
router.post('/', authenticateToken, (req, res) => {
  try {
    const { sessionId, tuteeId } = req.body;
    const tutorId = req.user!.userId;

    if (!sessionId) {
      res.status(400).json({ message: 'Session ID is required' });
      return;
    }

    // Create session
    const session = {
      id: sessionId,
      tutorId,
      tuteeId: tuteeId || null,
      status: 'active',
      agoraChannelName: `channel_${sessionId}`,
      whiteboardRoomId: `room_${sessionId}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    sessions.set(sessionId, session);

    res.json({ sessionId, session });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ message: 'Failed to create session' });
  }
});

/**
 * GET /api/sessions/:sessionId/validate
 * Validate session access
 */
router.get('/:sessionId/validate', authenticateToken, (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user!.userId;

    const session = sessions.get(sessionId);

    if (!session) {
      res.json({
        valid: false,
        message: 'Session not found'
      });
      return;
    }

    // Check if user has access (is tutor or tutee)
    const hasAccess = session.tutorId === userId || session.tuteeId === userId;

    if (!hasAccess) {
      res.json({
        valid: false,
        message: 'You do not have access to this session'
      });
      return;
    }

    res.json({
      valid: true,
      session
    });
  } catch (error) {
    console.error('Session validation error:', error);
    res.status(500).json({ 
      valid: false,
      message: 'Failed to validate session' 
    });
  }
});

/**
 * POST /api/sessions/:sessionId/end
 * End a session
 */
router.post('/:sessionId/end', authenticateToken, (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user!.userId;

    const session = sessions.get(sessionId);

    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }

    // Only tutor can end session
    if (session.tutorId !== userId) {
      res.status(403).json({ message: 'Only the tutor can end the session' });
      return;
    }

    // Update session status
    session.status = 'completed';
    session.updatedAt = new Date();
    sessions.set(sessionId, session);

    res.json({ message: 'Session ended successfully' });
  } catch (error) {
    console.error('Session end error:', error);
    res.status(500).json({ message: 'Failed to end session' });
  }
});

export default router;
