/**
 * Debug utility for verbose console logging
 * 
 * Provides debug logging that can be enabled/disabled via environment variable
 * Validates Requirement 12.7
 */

import errorLoggingService from '../services/ErrorLoggingService';

class DebugLogger {
  private isDebugMode: boolean;

  constructor() {
    this.isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'true' || import.meta.env.DEV;
  }

  /**
   * Check if debug mode is enabled
   */
  isEnabled(): boolean {
    return this.isDebugMode;
  }

  /**
   * Enable debug mode
   */
  enable(): void {
    this.isDebugMode = true;
    errorLoggingService.setDebugMode(true);
    console.log('[Debug] Debug mode enabled');
  }

  /**
   * Disable debug mode
   */
  disable(): void {
    this.isDebugMode = false;
    errorLoggingService.setDebugMode(false);
    console.log('[Debug] Debug mode disabled');
  }

  /**
   * Log a debug message
   */
  log(component: string, message: string, data?: any): void {
    if (!this.isDebugMode) return;

    const timestamp = new Date().toISOString();
    console.log(`[Debug][${timestamp}][${component}] ${message}`, data || '');
  }

  /**
   * Log a debug group (collapsible in console)
   */
  group(component: string, title: string, fn: () => void): void {
    if (!this.isDebugMode) return;

    console.group(`[Debug][${component}] ${title}`);
    fn();
    console.groupEnd();
  }

  /**
   * Log a debug table
   */
  table(component: string, title: string, data: any): void {
    if (!this.isDebugMode) return;

    console.log(`[Debug][${component}] ${title}`);
    console.table(data);
  }

  /**
   * Log operation timing
   */
  time(component: string, label: string): void {
    if (!this.isDebugMode) return;

    console.time(`[Debug][${component}] ${label}`);
  }

  /**
   * End operation timing
   */
  timeEnd(component: string, label: string): void {
    if (!this.isDebugMode) return;

    console.timeEnd(`[Debug][${component}] ${label}`);
  }

  /**
   * Log a warning in debug mode
   */
  warn(component: string, message: string, data?: any): void {
    if (!this.isDebugMode) return;

    const timestamp = new Date().toISOString();
    console.warn(`[Debug][${timestamp}][${component}] ${message}`, data || '');
  }

  /**
   * Log an error in debug mode
   */
  error(component: string, message: string, error?: any): void {
    if (!this.isDebugMode) return;

    const timestamp = new Date().toISOString();
    console.error(`[Debug][${timestamp}][${component}] ${message}`, error || '');
  }

  /**
   * Log state changes
   */
  logStateChange(component: string, stateName: string, oldValue: any, newValue: any): void {
    if (!this.isDebugMode) return;

    this.group(component, `State Change: ${stateName}`, () => {
      console.log('Old Value:', oldValue);
      console.log('New Value:', newValue);
      console.log('Changed:', oldValue !== newValue);
    });
  }

  /**
   * Log API request
   */
  logAPIRequest(component: string, method: string, endpoint: string, data?: any): void {
    if (!this.isDebugMode) return;

    this.group(component, `API Request: ${method} ${endpoint}`, () => {
      console.log('Method:', method);
      console.log('Endpoint:', endpoint);
      if (data) {
        console.log('Data:', data);
      }
      console.log('Timestamp:', new Date().toISOString());
    });
  }

  /**
   * Log API response
   */
  logAPIResponse(component: string, endpoint: string, status: number, data?: any): void {
    if (!this.isDebugMode) return;

    this.group(component, `API Response: ${endpoint}`, () => {
      console.log('Status:', status);
      console.log('Endpoint:', endpoint);
      if (data) {
        console.log('Data:', data);
      }
      console.log('Timestamp:', new Date().toISOString());
    });
  }

  /**
   * Log component lifecycle
   */
  logLifecycle(component: string, event: 'mount' | 'unmount' | 'update', data?: any): void {
    if (!this.isDebugMode) return;

    const emoji = event === 'mount' ? '🟢' : event === 'unmount' ? '🔴' : '🔄';
    console.log(`[Debug][${component}] ${emoji} ${event.toUpperCase()}`, data || '');
  }

  /**
   * Log performance metrics
   */
  logPerformance(component: string, operation: string, duration: number): void {
    if (!this.isDebugMode) return;

    const color = duration < 100 ? '🟢' : duration < 500 ? '🟡' : '🔴';
    console.log(`[Debug][${component}] ${color} ${operation}: ${duration.toFixed(2)}ms`);
  }
}

// Singleton instance
const debug = new DebugLogger();

// Expose to window for manual control in browser console
if (typeof window !== 'undefined') {
  (window as any).__DEBUG__ = {
    enable: () => debug.enable(),
    disable: () => debug.disable(),
    isEnabled: () => debug.isEnabled(),
    logs: () => errorLoggingService.getLogs(),
    exportLogs: () => errorLoggingService.exportLogs(),
    clearLogs: () => errorLoggingService.clearLogs(),
  };
}

export default debug;
