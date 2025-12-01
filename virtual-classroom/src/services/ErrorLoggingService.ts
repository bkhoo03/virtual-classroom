/**
 * ErrorLoggingService - Comprehensive error logging with context
 * 
 * Logs all errors with timestamp, user context, and stack traces
 * Validates Requirements 12.1, 12.5
 */

export interface ErrorContext {
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  additionalData?: Record<string, any>;
}

export interface ErrorLog {
  id: string;
  timestamp: Date;
  error: Error;
  message: string;
  stack?: string;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class ErrorLoggingService {
  private logs: ErrorLog[] = [];
  private maxLogs = 1000;
  private debugMode: boolean;

  constructor() {
    this.debugMode = import.meta.env.VITE_DEBUG_MODE === 'true' || import.meta.env.DEV;
  }

  /**
   * Log an error with full context
   */
  logError(
    error: Error,
    context: Partial<ErrorContext> = {},
    severity: ErrorLog['severity'] = 'medium'
  ): void {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      error,
      message: error.message,
      stack: error.stack,
      context: {
        timestamp: new Date(),
        ...context,
      },
      severity,
    };

    // Add to in-memory logs
    this.logs.push(errorLog);
    
    // Trim logs if exceeding max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console logging based on severity
    const logMethod = severity === 'critical' || severity === 'high' ? 'error' : 'warn';
    console[logMethod]('[ErrorLoggingService]', {
      message: error.message,
      severity,
      context: errorLog.context,
      stack: error.stack,
    });

    // In debug mode, log verbose details
    if (this.debugMode) {
      console.group(`🔴 Error Log [${severity.toUpperCase()}]`);
      console.log('Timestamp:', errorLog.timestamp.toISOString());
      console.log('Message:', error.message);
      console.log('Context:', errorLog.context);
      if (error.stack) {
        console.log('Stack Trace:', error.stack);
      }
      console.groupEnd();
    }

    // Persist to sessionStorage for debugging
    this.persistToStorage();
  }

  /**
   * Log a network error
   */
  logNetworkError(
    error: Error,
    endpoint: string,
    method: string,
    context: Partial<ErrorContext> = {}
  ): void {
    this.logError(error, {
      ...context,
      action: 'network_request',
      additionalData: {
        endpoint,
        method,
        ...context.additionalData,
      },
    }, 'high');
  }

  /**
   * Log an SDK initialization error
   */
  logSDKError(
    error: Error,
    sdkName: string,
    context: Partial<ErrorContext> = {}
  ): void {
    this.logError(error, {
      ...context,
      action: 'sdk_initialization',
      additionalData: {
        sdkName,
        ...context.additionalData,
      },
    }, 'critical');
  }

  /**
   * Log an authentication error
   */
  logAuthError(
    error: Error,
    context: Partial<ErrorContext> = {}
  ): void {
    this.logError(error, {
      ...context,
      action: 'authentication',
    }, 'high');
  }

  /**
   * Log a component error (from error boundary)
   */
  logComponentError(
    error: Error,
    componentStack: string,
    context: Partial<ErrorContext> = {}
  ): void {
    this.logError(error, {
      ...context,
      action: 'component_render',
      additionalData: {
        componentStack,
        ...context.additionalData,
      },
    }, 'high');
  }

  /**
   * Get all error logs
   */
  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  /**
   * Get logs by severity
   */
  getLogsBySeverity(severity: ErrorLog['severity']): ErrorLog[] {
    return this.logs.filter(log => log.severity === severity);
  }

  /**
   * Get recent logs (last N logs)
   */
  getRecentLogs(count: number = 10): ErrorLog[] {
    return this.logs.slice(-count);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    sessionStorage.removeItem('error_logs');
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Check if debug mode is enabled
   */
  isDebugMode(): boolean {
    return this.debugMode;
  }

  /**
   * Enable/disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    if (enabled) {
      console.log('[ErrorLoggingService] Debug mode enabled');
    }
  }

  /**
   * Generate unique ID for error log
   */
  private generateId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Persist logs to sessionStorage
   */
  private persistToStorage(): void {
    try {
      const recentLogs = this.getRecentLogs(50); // Store last 50 logs
      sessionStorage.setItem('error_logs', JSON.stringify(recentLogs));
    } catch (error) {
      // Ignore storage errors
      console.warn('[ErrorLoggingService] Failed to persist logs to storage:', error);
    }
  }

  /**
   * Load logs from sessionStorage
   */
  loadFromStorage(): void {
    try {
      const stored = sessionStorage.getItem('error_logs');
      if (stored) {
        const logs = JSON.parse(stored);
        this.logs = logs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
          context: {
            ...log.context,
            timestamp: new Date(log.context.timestamp),
          },
        }));
      }
    } catch (error) {
      console.warn('[ErrorLoggingService] Failed to load logs from storage:', error);
    }
  }
}

// Singleton instance
const errorLoggingService = new ErrorLoggingService();

// Load persisted logs on initialization
errorLoggingService.loadFromStorage();

export default errorLoggingService;
