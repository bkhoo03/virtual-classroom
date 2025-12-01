import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';
import errorLoggingService from '../services/ErrorLoggingService';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  component?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component catches JavaScript errors anywhere in the child component tree,
 * logs those errors with full context, and displays a fallback UI instead of crashing the whole app.
 * 
 * Validates Requirements 12.4 (Error boundary catching)
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error with comprehensive context using ErrorLoggingService
    errorLoggingService.logComponentError(
      error,
      errorInfo.componentStack || '',
      {
        component: this.props.component || 'Unknown',
        additionalData: {
          errorBoundary: true,
          componentStack: errorInfo.componentStack,
        },
      }
    );
    
    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-[#03071E] flex items-center justify-center p-8">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg
                  className="w-12 h-12 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-[#03071E] mb-2">
                  Something went wrong
                </h2>
                <p className="text-gray-600 mb-4">
                  We're sorry, but something unexpected happened. The error has been logged
                  and we'll look into it.
                </p>
                
                {import.meta.env.DEV && this.state.error && (
                  <details className="mb-4">
                    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                      Error details (development only)
                    </summary>
                    <div className="bg-gray-50 rounded-lg p-4 text-sm font-mono overflow-auto">
                      <div className="text-red-600 mb-2">
                        <strong>Error:</strong> {this.state.error.message}
                      </div>
                      {this.state.errorInfo && (
                        <div className="text-gray-700">
                          <strong>Component Stack:</strong>
                          <pre className="mt-2 whitespace-pre-wrap">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    onClick={this.handleReset}
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => window.location.href = '/'}
                  >
                    Go to Home
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
