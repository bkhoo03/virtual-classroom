import { apiClient } from '../utils/apiClient';
import type { AuthCredentials, LoginResponse, TokenValidationResponse, User } from '../types/auth.types';

class AuthService {
  private static instance: AuthService;
  private accessToken: string | null = null;

  private constructor() {
    // Load token from localStorage on initialization
    this.accessToken = localStorage.getItem('accessToken');
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Login with email and password
   */
  public async login(credentials: AuthCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(
        '/api/auth/login',
        credentials
      );

      const { user, tokens } = response.data;

      // Store tokens
      this.setTokens(tokens.accessToken, tokens.refreshToken);

      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        throw new Error('Cannot connect to server. Please ensure the backend is running.');
      }
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  /**
   * Logout and clear tokens
   */
  public async logout(): Promise<void> {
    try {
      // Call backend to invalidate refresh token
      await apiClient.post('/api/auth/logout', {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens regardless of API call success
      this.clearTokens();
    }
  }

  /**
   * Validate current access token
   */
  public async validateToken(): Promise<TokenValidationResponse> {
    if (!this.accessToken) {
      return { valid: false };
    }

    try {
      const response = await apiClient.get<TokenValidationResponse>('/api/auth/validate');
      return response.data;
    } catch (error) {
      console.error('Token validation error:', error);
      return { valid: false };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  public async refreshAccessToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await apiClient.post<{ accessToken: string; expiresIn: number }>(
        '/api/auth/refresh',
        { refreshToken }
      );

      const { accessToken } = response.data;
      this.setAccessToken(accessToken);

      return accessToken;
    } catch (error) {
      // If refresh fails, clear all tokens
      this.clearTokens();
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Get current user from token
   */
  public async getCurrentUser(): Promise<User | null> {
    const validation = await this.validateToken();
    return validation.valid && validation.user ? validation.user : null;
  }

  /**
   * Get access token
   */
  public getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Get authorization headers
   */
  public getAuthHeaders(): Record<string, string> {
    if (!this.accessToken) {
      return {};
    }

    return {
      Authorization: `Bearer ${this.accessToken}`
    };
  }

  /**
   * Set tokens in memory and localStorage
   */
  private setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  /**
   * Set only access token
   */
  private setAccessToken(accessToken: string): void {
    this.accessToken = accessToken;
    localStorage.setItem('accessToken', accessToken);
  }

  /**
   * Clear all tokens
   */
  private clearTokens(): void {
    this.accessToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

export default AuthService.getInstance();
