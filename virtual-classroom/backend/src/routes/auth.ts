import express from 'express';
import { AuthService } from '../services/authService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const result = await AuthService.login(email, password);
    res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ message: error instanceof Error ? error.message : 'Login failed' });
  }
});

/**
 * POST /api/auth/logout
 * Logout (client-side token removal)
 */
router.post('/logout', authenticateToken, (req, res) => {
  // In a production app with refresh token storage, invalidate the refresh token here
  res.json({ message: 'Logged out successfully' });
});

/**
 * GET /api/auth/validate
 * Validate current access token
 */
router.get('/validate', authenticateToken, (req, res) => {
  const user = AuthService.getUserById(req.user!.userId);
  
  if (!user) {
    res.status(404).json({ valid: false, message: 'User not found' });
    return;
  }

  res.json({
    valid: true,
    user
  });
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ message: 'Refresh token is required' });
      return;
    }

    const result = await AuthService.refreshAccessToken(refreshToken);
    res.json(result);
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

export default router;
