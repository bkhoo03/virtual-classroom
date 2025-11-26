import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/LoginForm';
import { PageTransition } from '../components/PageTransition';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, login, clearError } = useAuth();

  // Get the redirect path from location state, or default to home
  const from = (location.state as any)?.from?.pathname || '/';

  useEffect(() => {
    // If already authenticated, redirect
    if (state.isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [state.isAuthenticated, navigate, from]);

  useEffect(() => {
    // Clear any previous errors when component mounts
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
      await login(credentials);
      // Navigation will happen automatically via the useEffect above
    } catch (error) {
      // Error is handled by the auth context
      console.error('Login failed:', error);
      
      // Check if it's a connection error
      if (error instanceof Error && error.message.includes('Network Error')) {
        console.error('Backend server is not running. Please start it with: cd backend && npm run dev');
      }
    }
  };

  // Show loading state while checking authentication
  if (state.isLoading && !state.error) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[var(--color-primary)] border-t-[var(--color-accent)] mb-4"></div>
          <p className="text-[var(--color-text-secondary)] text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <LoginForm
        onSubmit={handleLogin}
        error={state.error}
        isLoading={state.isLoading}
      />
    </PageTransition>
  );
}
