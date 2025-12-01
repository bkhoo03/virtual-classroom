/**
 * Property-Based Tests for Error Handling
 * 
 * Tests comprehensive error handling including:
 * - Error logging with context
 * - SDK initialization error messages
 * - Exponential backoff reconnection
 * - Error boundary catching
 * - Error recovery notification
 * - Debug mode verbose logging
 * 
 * Validates Requirements 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import errorLoggingService from '../services/ErrorLoggingService';
import reconnectionService from '../services/ReconnectionService';
import debug from '../utils/debug';

describe('Error Handling Property Tests', () => {
  beforeEach(() => {
    // Clear logs before each test
    errorLoggingService.clearLogs();
  });

  /**
   * **Feature: classroom-ui-overhaul, Property 51: Comprehensive error logging**
   * **Validates: Requirements 12.1, 12.5**
   * 
   * For any error that occurs, the error should be logged with timestamp, user context, and stack trace
   */
  it('Property 51: should log all errors with timestamp, user context, and stack trace', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }), // error message
        fc.uuid(), // userId
        fc.uuid(), // sessionId
        fc.string({ minLength: 1, maxLength: 50 }), // component
        fc.string({ minLength: 1, maxLength: 50 }), // action
        (errorMessage, userId, sessionId, component, action) => {
          // Create an error
          const error = new Error(errorMessage);
          
          // Log the error with context
          errorLoggingService.logError(error, {
            userId,
            sessionId,
            component,
            action,
          });

          // Get the most recent log
          const logs = errorLoggingService.getLogs();
          const latestLog = logs[logs.length - 1];

          // Verify the log has all required fields
          expect(latestLog).toBeDefined();
          expect(latestLog.timestamp).toBeInstanceOf(Date);
          expect(latestLog.error).toBe(error);
          expect(latestLog.message).toBe(errorMessage);
          expect(latestLog.stack).toBeDefined();
          expect(latestLog.context.userId).toBe(userId);
          expect(latestLog.context.sessionId).toBe(sessionId);
          expect(latestLog.context.component).toBe(component);
          expect(latestLog.context.action).toBe(action);
          expect(latestLog.context.timestamp).toBeInstanceOf(Date);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: classroom-ui-overhaul, Property 52: SDK initialization error messages**
   * **Validates: Requirements 12.2**
   * 
   * For any SDK initialization failure, a user-friendly error message should be displayed
   */
  it('Property 52: should log SDK errors with user-friendly messages', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }), // error message
        fc.constantFrom('Agora RTC', 'Agora Whiteboard', 'OpenAI'), // SDK name
        (errorMessage, sdkName) => {
          // Create an SDK error
          const error = new Error(errorMessage);
          
          // Log the SDK error
          errorLoggingService.logSDKError(error, sdkName);

          // Get the most recent log
          const logs = errorLoggingService.getLogs();
          const latestLog = logs[logs.length - 1];

          // Verify the log has SDK-specific context
          expect(latestLog).toBeDefined();
          expect(latestLog.severity).toBe('critical');
          expect(latestLog.context.action).toBe('sdk_initialization');
          expect(latestLog.context.additionalData?.sdkName).toBe(sdkName);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: classroom-ui-overhaul, Property 53: Exponential backoff reconnection**
   * **Validates: Requirements 12.3**
   * 
   * For any network error, reconnection attempts should use exponential backoff timing
   */
  it('Property 53: should use exponential backoff for reconnection attempts', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }), // attempt number
        fc.integer({ min: 100, max: 2000 }), // initial delay
        fc.integer({ min: 10000, max: 60000 }), // max delay
        fc.integer({ min: 2, max: 4 }), // multiplier
        (attempt, initialDelay, maxDelay, multiplier) => {
          // Calculate expected delay
          const expectedDelay = Math.min(
            initialDelay * Math.pow(multiplier, attempt - 1),
            maxDelay
          );

          // Calculate actual delay using reconnection service
          const actualDelay = reconnectionService.calculateBackoffDelay(
            attempt,
            initialDelay,
            maxDelay,
            multiplier
          );

          // Verify exponential backoff
          expect(actualDelay).toBe(expectedDelay);
          expect(actualDelay).toBeLessThanOrEqual(maxDelay);
          
          // Verify exponential growth (for attempts within max delay)
          if (attempt > 1 && actualDelay < maxDelay) {
            const previousDelay = reconnectionService.calculateBackoffDelay(
              attempt - 1,
              initialDelay,
              maxDelay,
              multiplier
            );
            expect(actualDelay).toBeGreaterThan(previousDelay);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: classroom-ui-overhaul, Property 54: Error boundary catching**
   * **Validates: Requirements 12.4**
   * 
   * For any critical error in a component, the error boundary should catch it and display a fallback UI
   * 
   * Note: This property tests the error logging aspect. Full error boundary testing requires React testing.
   */
  it('Property 54: should log component errors caught by error boundaries', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }), // error message
        fc.string({ minLength: 1, maxLength: 50 }), // component name
        fc.string({ minLength: 10, maxLength: 500 }), // component stack
        (errorMessage, componentName, componentStack) => {
          // Create a component error
          const error = new Error(errorMessage);
          
          // Log the component error (as error boundary would)
          errorLoggingService.logComponentError(error, componentStack, {
            component: componentName,
          });

          // Get the most recent log
          const logs = errorLoggingService.getLogs();
          const latestLog = logs[logs.length - 1];

          // Verify the log has component-specific context
          expect(latestLog).toBeDefined();
          expect(latestLog.severity).toBe('high');
          expect(latestLog.context.action).toBe('component_render');
          expect(latestLog.context.component).toBe(componentName);
          expect(latestLog.context.additionalData?.componentStack).toBe(componentStack);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: classroom-ui-overhaul, Property 55: Error recovery notification**
   * **Validates: Requirements 12.6**
   * 
   * For any successful error recovery, the user should be notified of the recovery
   * 
   * Note: This tests the reconnection service's recovery callback mechanism
   */
  it('Property 55: should notify on successful reconnection', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 3 }), // number of attempts before success
        async (attemptsBeforeSuccess) => {
          let recoveryNotified = false;
          let currentAttempt = 0;

          // Mock reconnection function that succeeds after N attempts
          const mockReconnect = async () => {
            currentAttempt++;
            if (currentAttempt >= attemptsBeforeSuccess) {
              return; // Success
            }
            throw new Error('Connection failed');
          };

          // Attempt reconnection with recovery callback
          const success = await reconnectionService.reconnectWithBackoff(
            mockReconnect,
            {
              maxAttempts: 5,
              initialDelay: 10,
              maxDelay: 100,
              onRecovery: () => {
                recoveryNotified = true;
              },
            }
          );

          // Verify recovery was notified
          expect(success).toBe(true);
          expect(recoveryNotified).toBe(true);
          expect(currentAttempt).toBe(attemptsBeforeSuccess);
        }
      ),
      { numRuns: 20 } // Fewer runs for async tests
    );
  });

  /**
   * **Feature: classroom-ui-overhaul, Property 56: Debug mode verbose logging**
   * **Validates: Requirements 12.7**
   * 
   * For any operation when debug mode is enabled, verbose logs should be written to the console
   */
  it('Property 56: should enable verbose logging in debug mode', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // component
        fc.string({ minLength: 1, maxLength: 100 }), // message
        fc.record({
          key1: fc.string(),
          key2: fc.integer(),
        }), // data
        (component, message, data) => {
          // Spy on console.log
          const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

          // Enable debug mode
          debug.enable();

          // Log a debug message
          debug.log(component, message, data);

          // Verify console.log was called
          expect(consoleSpy).toHaveBeenCalled();
          const callArgs = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
          expect(callArgs[0]).toContain('[Debug]');
          expect(callArgs[0]).toContain(component);
          expect(callArgs[0]).toContain(message);

          // Disable debug mode
          debug.disable();

          // Clear the spy
          consoleSpy.mockRestore();

          // Log another message (should not be logged)
          const consoleSpy2 = vi.spyOn(console, 'log').mockImplementation(() => {});
          debug.log(component, 'should not log', data);
          
          // Verify console.log was not called for debug messages
          const debugCalls = consoleSpy2.mock.calls.filter(call => 
            call[0] && typeof call[0] === 'string' && call[0].includes('[Debug]')
          );
          expect(debugCalls.length).toBe(0);

          consoleSpy2.mockRestore();
        }
      ),
      { numRuns: 50 } // Fewer runs due to console mocking
    );
  });

  /**
   * Additional property: Error log persistence
   * Verifies that error logs are persisted to sessionStorage
   */
  it('should persist error logs to sessionStorage', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            message: fc.string({ minLength: 1, maxLength: 100 }),
            component: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (errors) => {
          // Clear logs
          errorLoggingService.clearLogs();

          // Log multiple errors
          errors.forEach(({ message, component }) => {
            const error = new Error(message);
            errorLoggingService.logError(error, { component });
          });

          // Get logs
          const logs = errorLoggingService.getLogs();

          // Verify all errors were logged
          expect(logs.length).toBe(errors.length);

          // Verify logs can be loaded from storage
          const newService = Object.create(Object.getPrototypeOf(errorLoggingService));
          newService.logs = [];
          newService.loadFromStorage();

          // Should have loaded recent logs
          expect(newService.logs.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Additional property: Error severity levels
   * Verifies that errors are logged with appropriate severity levels
   */
  it('should categorize errors by severity', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('low', 'medium', 'high', 'critical'),
        fc.string({ minLength: 1, maxLength: 100 }),
        (severity, message) => {
          // Clear logs
          errorLoggingService.clearLogs();

          // Log error with specific severity
          const error = new Error(message);
          errorLoggingService.logError(error, {}, severity as any);

          // Get logs by severity
          const logs = errorLoggingService.getLogsBySeverity(severity as any);

          // Verify the error was logged with correct severity
          expect(logs.length).toBe(1);
          expect(logs[0].severity).toBe(severity);
          expect(logs[0].message).toBe(message);
        }
      ),
      { numRuns: 100 }
    );
  });
});
