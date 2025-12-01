/**
 * ReconnectionService - Handles automatic reconnection with exponential backoff
 * 
 * Implements exponential backoff for network errors, displays reconnection status,
 * and notifies users on successful recovery
 * Validates Requirements 12.3, 12.6
 */

import errorLoggingService from './ErrorLoggingService';

export interface ReconnectionConfig {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  onStatusChange?: (status: ReconnectionStatus) => void;
  onRecovery?: () => void;
}

export interface ReconnectionStatus {
  isReconnecting: boolean;
  attempt: number;
  maxAttempts: number;
  nextRetryIn?: number;
  lastError?: string;
}

export type ReconnectionCallback = () => Promise<void>;

class ReconnectionService {
  private defaultConfig: Required<Omit<ReconnectionConfig, 'onStatusChange' | 'onRecovery'>> = {
    maxAttempts: 5,
    initialDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    backoffMultiplier: 2,
  };

  /**
   * Attempt to reconnect with exponential backoff
   */
  async reconnectWithBackoff(
    reconnectFn: ReconnectionCallback,
    config: ReconnectionConfig = {}
  ): Promise<boolean> {
    const {
      maxAttempts = this.defaultConfig.maxAttempts,
      initialDelay = this.defaultConfig.initialDelay,
      maxDelay = this.defaultConfig.maxDelay,
      backoffMultiplier = this.defaultConfig.backoffMultiplier,
      onStatusChange,
      onRecovery,
    } = config;

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < maxAttempts) {
      attempt++;

      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(backoffMultiplier, attempt - 1),
        maxDelay
      );

      // Update status
      const status: ReconnectionStatus = {
        isReconnecting: true,
        attempt,
        maxAttempts,
        nextRetryIn: attempt < maxAttempts ? delay : undefined,
        lastError: lastError?.message,
      };

      if (onStatusChange) {
        onStatusChange(status);
      }

      // Log reconnection attempt
      console.log(`[ReconnectionService] Attempt ${attempt}/${maxAttempts}`);
      if (errorLoggingService.isDebugMode()) {
        console.log(`[ReconnectionService] Next retry in ${delay}ms`);
      }

      try {
        // Attempt reconnection
        await reconnectFn();

        // Success! Log recovery
        errorLoggingService.logError(
          new Error('Connection recovered'),
          {
            component: 'ReconnectionService',
            action: 'reconnect_success',
            additionalData: {
              attempt,
              totalAttempts: maxAttempts,
            },
          },
          'low'
        );

        // Update status to not reconnecting
        if (onStatusChange) {
          onStatusChange({
            isReconnecting: false,
            attempt,
            maxAttempts,
          });
        }

        // Notify recovery
        if (onRecovery) {
          onRecovery();
        }

        console.log(`[ReconnectionService] ✅ Reconnection successful after ${attempt} attempt(s)`);
        return true;
      } catch (error) {
        lastError = error as Error;

        // Log the failed attempt
        errorLoggingService.logError(
          error as Error,
          {
            component: 'ReconnectionService',
            action: 'reconnect_attempt_failed',
            additionalData: {
              attempt,
              maxAttempts,
              delay,
            },
          },
          'medium'
        );

        console.error(`[ReconnectionService] ❌ Attempt ${attempt} failed:`, error);

        // If not the last attempt, wait before retrying
        if (attempt < maxAttempts) {
          console.log(`[ReconnectionService] Waiting ${delay}ms before next attempt...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All attempts failed
    errorLoggingService.logError(
      lastError || new Error('Reconnection failed'),
      {
        component: 'ReconnectionService',
        action: 'reconnect_all_attempts_failed',
        additionalData: {
          totalAttempts: maxAttempts,
        },
      },
      'high'
    );

    // Update status to not reconnecting (failed)
    if (onStatusChange) {
      onStatusChange({
        isReconnecting: false,
        attempt: maxAttempts,
        maxAttempts,
        lastError: lastError?.message || 'Unknown error',
      });
    }

    console.error(`[ReconnectionService] ❌ All ${maxAttempts} reconnection attempts failed`);
    return false;
  }

  /**
   * Calculate the next retry delay using exponential backoff
   */
  calculateBackoffDelay(
    attempt: number,
    initialDelay: number = this.defaultConfig.initialDelay,
    maxDelay: number = this.defaultConfig.maxDelay,
    multiplier: number = this.defaultConfig.backoffMultiplier
  ): number {
    return Math.min(
      initialDelay * Math.pow(multiplier, attempt - 1),
      maxDelay
    );
  }

  /**
   * Create a reconnection handler for a specific service
   */
  createReconnectionHandler(
    serviceName: string,
    reconnectFn: ReconnectionCallback,
    config: ReconnectionConfig = {}
  ): () => Promise<boolean> {
    return async () => {
      console.log(`[ReconnectionService] Starting reconnection for ${serviceName}`);
      
      const result = await this.reconnectWithBackoff(reconnectFn, {
        ...config,
        onStatusChange: (status) => {
          console.log(`[ReconnectionService] ${serviceName} status:`, status);
          if (config.onStatusChange) {
            config.onStatusChange(status);
          }
        },
        onRecovery: () => {
          console.log(`[ReconnectionService] ${serviceName} recovered successfully`);
          if (config.onRecovery) {
            config.onRecovery();
          }
        },
      });

      return result;
    };
  }
}

// Singleton instance
const reconnectionService = new ReconnectionService();

export default reconnectionService;
