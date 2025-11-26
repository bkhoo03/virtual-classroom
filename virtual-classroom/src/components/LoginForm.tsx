import { useState } from 'react';
import type { FormEvent } from 'react';
import type { AuthCredentials } from '../types/auth.types';

interface LoginFormProps {
  onSubmit: (credentials: AuthCredentials) => Promise<void>;
  error: string | null;
  isLoading: boolean;
}

export default function LoginForm({ onSubmit, error, isLoading }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    await onSubmit({ email, password });
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle background elements - light theme */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-[var(--color-primary)] rounded-full blur-3xl opacity-[0.02] -top-48 -left-48"></div>
        <div className="absolute w-96 h-96 bg-[var(--color-accent)] rounded-full blur-3xl opacity-[0.015] -bottom-48 -right-48"></div>
        <div className="absolute w-64 h-64 bg-[var(--color-secondary)] rounded-full blur-3xl opacity-[0.02] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="relative bg-[var(--color-surface-elevated)]/95 backdrop-blur-xl rounded-2xl shadow-[var(--shadow-xl)] p-10 max-w-md w-full border border-[var(--color-border)]">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[var(--shadow-lg)] transform hover:scale-105 transition-transform">
            <svg className="w-10 h-10 text-[var(--color-text-inverse)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent mb-3">
            Virtual Classroom
          </h1>
          <p className="text-[var(--color-text-secondary)] text-lg">Sign in to start your learning journey</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[var(--color-error-bg)] border-l-4 border-[var(--color-error)] rounded-lg animate-error-shake">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-[var(--color-error)] mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-[var(--color-error)] font-medium">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-[var(--color-text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full pl-14 pr-5 py-4 bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-border-focus)] focus:bg-[var(--color-background)] transition-all text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)]"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-[var(--color-text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-14 pr-14 py-4 bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-border-focus)] focus:bg-[var(--color-background)] transition-all text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)]"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)] transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full px-6 py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-[var(--color-text-inverse)] rounded-xl hover:shadow-[var(--shadow-lg)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-semibold text-lg"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[var(--color-text-inverse)]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
          <div className="bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 rounded-lg p-4">
            <p className="text-xs font-semibold text-[var(--color-text-primary)] mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-xs text-[var(--color-text-secondary)]">
              <p>📧 <span className="font-mono">tutor@example.com</span></p>
              <p>🔑 <span className="font-mono">password</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
