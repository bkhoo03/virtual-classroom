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
const LoadingStatesDemo = lazy(() => import('./components/LoadingStatesDemo'));

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
  // Check for critical environment variables
  const missingEnvVars: string[] = [];
  
  if (!import.meta.env.VITE_AGORA_APP_ID) missingEnvVars.push('VITE_AGORA_APP_ID');
  if (!import.meta.env.VITE_BACKEND_URL) missingEnvVars.push('VITE_BACKEND_URL');
  
  if (missingEnvVars.length > 0) {
    console.error('Missing environment variables:', missingEnvVars);
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
          <p className="text-gray-700 mb-4">
            The application is missing required environment variables:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4">
            {missingEnvVars.map(varName => (
              <li key={varName}>{varName}</li>
            ))}
          </ul>
          <p className="text-sm text-gray-500">
            Please configure these variables in your deployment settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary component="App">
      {/* Skip to main content link for keyboard navigation */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login" element={
                  <ErrorBoundary component="LoginPage">
                    <LoginPage />
                  </ErrorBoundary>
                } />
                <Route path="/demo/loading" element={
                  <ErrorBoundary component="LoadingStatesDemo">
                    <LoadingStatesDemo />
                  </ErrorBoundary>
                } />
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary component="HomePage">
                        <HomePage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/classroom/:sessionId" 
                  element={
                    <ProtectedRoute>
                      <ClassroomProvider>
                        <ErrorBoundary component="ClassroomPage">
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
