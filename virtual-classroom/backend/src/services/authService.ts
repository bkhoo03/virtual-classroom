import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config/env.js';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'tutor' | 'tutee';
  passwordHash?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Service for handling authentication
 * In production, this should connect to a real database
 */
export class AuthService {
  // Mock user database (replace with real database in production)
  private static users: User[] = [
    {
      id: 'user_1',
      name: 'John Tutor',
      email: 'tutor@example.com',
      role: 'tutor',
      passwordHash: bcrypt.hashSync('password', 10)
    },
    {
      id: 'user_2',
      name: 'Jane Student',
      email: 'student@example.com',
      role: 'tutee',
      passwordHash: bcrypt.hashSync('password', 10)
    }
  ];

  /**
   * Authenticate user with email and password
   */
  static async login(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
    const user = this.users.find(u => u.email === email);

    if (!user || !user.passwordHash) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens
    };
  }

  /**
   * Generate JWT access and refresh tokens
   */
  static generateTokens(user: User): AuthTokens {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn
    });

    const refreshToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtRefreshExpiresIn
    });

    // Calculate expiration time in seconds
    const expiresIn = this.parseExpirationTime(config.jwtExpiresIn);

    return {
      accessToken,
      refreshToken,
      expiresIn
    };
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): { userId: string; email: string; role: string } {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Refresh access token
   */
  static async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const decoded = this.verifyToken(refreshToken);
      
      const user = this.users.find(u => u.id === decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      const payload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      const accessToken = jwt.sign(payload, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn
      });

      const expiresIn = this.parseExpirationTime(config.jwtExpiresIn);

      return { accessToken, expiresIn };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Get user by ID
   */
  static getUserById(userId: string): User | null {
    const user = this.users.find(u => u.id === userId);
    if (!user) return null;

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Parse expiration time string to seconds
   */
  private static parseExpirationTime(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 86400; // Default to 24 hours

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 86400;
    }
  }
}
