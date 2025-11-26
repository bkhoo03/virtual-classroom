// Authentication and authorization types

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'tutor' | 'tutee';
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface TokenValidationResponse {
  valid: boolean;
  user?: User;
}
