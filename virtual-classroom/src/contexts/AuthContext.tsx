import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AuthState, AuthCredentials, User } from '../types/auth.types';
import AuthService from '../services/AuthService';

// Initial state
const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
}

// Context type
interface AuthContextType {
  state: AuthState;
  login: (credentials: AuthCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      dispatch({ type: 'AUTH_START' });

      try {
        const user = await AuthService.getCurrentUser();
        
        if (user) {
          dispatch({ type: 'AUTH_SUCCESS', payload: { user } });
        } else {
          dispatch({ type: 'AUTH_FAILURE', payload: 'Not authenticated' });
        }
      } catch (error) {
        dispatch({ type: 'AUTH_FAILURE', payload: 'Authentication check failed' });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = useCallback(async (credentials: AuthCredentials) => {
    dispatch({ type: 'AUTH_START' });

    try {
      const { user } = await AuthService.login(credentials);
      dispatch({ type: 'AUTH_SUCCESS', payload: { user } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  return (
    <AuthContext.Provider value={{ state, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
