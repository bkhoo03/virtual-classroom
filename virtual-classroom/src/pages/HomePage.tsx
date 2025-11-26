import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SessionSecurityService from '../services/SessionSecurityService';
import { PageTransition } from '../components/PageTransition';

export default function HomePage() {
  const [sessionId, setSessionId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { state, logout } = useAuth();

  const handleJoinClassroom = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (sessionId.trim().length >= 8) {
      navigate(`/classroom/${sessionId.trim()}`);
    }
  };

  const handleCreateSession = async () => {
    setIsCreating(true);
    try {
      // Generate a secure session ID
      const newSessionId = SessionSecurityService.generateSessionId();
      
      // Navigate directly - session will be created when joining
      navigate(`/classroom/${newSessionId}`);
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to create session. Please try again.');
      setIsCreating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle background elements - light theme */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-[var(--color-primary)] rounded-full blur-3xl opacity-[0.02] -top-48 -left-48"></div>
        <div className="absolute w-96 h-96 bg-[var(--color-accent)] rounded-full blur-3xl opacity-[0.015] -bottom-48 -right-48"></div>
        <div className="absolute w-64 h-64 bg-[var(--color-secondary)] rounded-full blur-3xl opacity-[0.02] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="relative bg-[var(--color-surface-elevated)]/95 backdrop-blur-xl rounded-2xl shadow-[var(--shadow-xl)] p-10 max-w-md w-full border border-[var(--color-border)]">
        {/* User info and logout button */}
        {state.user && (
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--color-border)]">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full flex items-center justify-center mr-3 shadow-[var(--shadow-lg)]">
                <span className="text-[var(--color-text-inverse)] font-bold text-lg">
                  {state.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{state.user.name}</p>
                <p className="text-xs text-[var(--color-text-secondary)] capitalize flex items-center gap-1">
                  <span className={state.user.role === 'tutor' ? '👨‍🏫' : '👨‍🎓'}></span>
                  {state.user.role}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors font-medium px-3 py-1.5 hover:bg-[var(--color-hover-bg)] rounded-lg"
            >
              Logout
            </button>
          </div>
        )}

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[var(--shadow-lg)] transform hover:scale-105 transition-transform">
            <svg className="w-10 h-10 text-[var(--color-text-inverse)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent mb-3">
            Virtual Classroom
          </h1>
          <p className="text-[var(--color-text-secondary)] text-lg">Join or create a classroom session</p>
        </div>

        <form onSubmit={handleJoinClassroom} className="space-y-5 mb-6">
          <div>
            <label htmlFor="sessionId" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
              Session ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-[var(--color-text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <input
                id="sessionId"
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="session-abc123xyz"
                className="w-full pl-14 pr-5 py-4 bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-border-focus)] focus:bg-[var(--color-background)] transition-all text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)]"
                minLength={8}
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={sessionId.trim().length < 8}
            className="w-full px-6 py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-[var(--color-text-inverse)] rounded-xl hover:shadow-[var(--shadow-lg)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-semibold text-lg"
          >
            Join Classroom
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--color-border)]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-[var(--color-surface-elevated)] text-[var(--color-text-tertiary)] font-medium">or</span>
          </div>
        </div>

        <button
          onClick={handleCreateSession}
          disabled={isCreating}
          className="w-full px-6 py-4 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-light)] text-[var(--color-text-primary)] rounded-xl hover:shadow-[var(--shadow-lg)] hover:scale-[1.02] transition-all font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isCreating ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[var(--color-text-primary)]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Session...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Session
            </span>
          )}
        </button>
      </div>
    </div>
    </PageTransition>
  );
}
