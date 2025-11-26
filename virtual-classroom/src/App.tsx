import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ClassroomProvider } from './contexts/ClassroomContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ClassroomPage = lazy(() => import('./pages/ClassroomPage'));

// Loading fallback component with fade animation
function PageLoader() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center animate-fade-in">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#5C0099] border-t-[#FDC500] mb-4"></div>
        <p className="text-white text-lg">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      {/* Skip to main content link for keyboard navigation */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/classroom/:sessionId" 
                  element={
                    <ProtectedRoute>
                      <ClassroomProvider>
                        <ErrorBoundary>
                          <ClassroomPage />
                        </ErrorBoundary>
                      </ClassroomProvider>
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
