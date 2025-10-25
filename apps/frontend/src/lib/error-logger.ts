/**
 * Error logging utility for frontend applications
 * 
 * Provides centralized error logging with:
 * - Automatic retry with exponential backoff
 * - Development vs production behavior
 * - Type-safe error payload
 * - Network failure handling
 */

interface ErrorLogPayload {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  context?: Record<string, any>;
  level?: 'error' | 'warning' | 'info';
  digest?: string;
  lineNumber?: number;
  columnNumber?: number;
}

interface LogErrorOptions {
  context?: Record<string, any>;
  level?: 'error' | 'warning' | 'info';
  digest?: string;
  lineNumber?: number;
  columnNumber?: number;
}

class ErrorLogger {
  private readonly maxRetries = 3;
  private readonly baseDelay = 1000; // 1 second
  private readonly apiEndpoint = '/api/v1/logs/frontend';

  /**
   * Log an error to the backend
   * 
   * @param error - The error to log
   * @param options - Additional logging options
   */
  async logError(error: Error, options: LogErrorOptions = {}): Promise<void> {
    const payload = this.createErrorPayload(error, options);
    
    // In development, always log to console
    if (process.env.NODE_ENV === 'development') {
      console.error('Frontend Error:', error);
      console.error('Error Payload:', payload);
    }

    // In production, send to backend
    if (process.env.NODE_ENV === 'production') {
      await this.sendToBackend(payload);
    }
  }

  /**
   * Log a custom error message
   * 
   * @param message - Error message
   * @param options - Additional logging options
   */
  async logMessage(message: string, options: LogErrorOptions = {}): Promise<void> {
    const error = new Error(message);
    await this.logError(error, options);
  }

  /**
   * Create error payload from Error object
   * 
   * @param error - The error object
   * @param options - Additional options
   * @returns ErrorLogPayload
   */
  private createErrorPayload(error: Error, options: LogErrorOptions): ErrorLogPayload {
    const stack = error.stack || '';
    const lineMatch = stack.match(/at .*:(\d+):(\d+)/);
    
    return {
      message: error.message,
      stack: stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      context: options.context,
      level: options.level || 'error',
      digest: options.digest,
      lineNumber: options.lineNumber || (lineMatch ? parseInt(lineMatch[1]) : undefined),
      columnNumber: options.columnNumber || (lineMatch ? parseInt(lineMatch[2]) : undefined),
    };
  }

  /**
   * Send error payload to backend with retry logic
   * 
   * @param payload - Error payload to send
   */
  private async sendToBackend(payload: ErrorLogPayload): Promise<void> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(this.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          // Success - no need to retry
          return;
        }

        // If not the last attempt, wait before retrying
        if (attempt < this.maxRetries) {
          const delay = this.baseDelay * Math.pow(2, attempt - 1);
          await this.delay(delay);
        }
      } catch (networkError) {
        // Network error - retry if not the last attempt
        if (attempt < this.maxRetries) {
          const delay = this.baseDelay * Math.pow(2, attempt - 1);
          await this.delay(delay);
        } else {
          // Final attempt failed - log to console as fallback
          console.error('Failed to send error to backend after all retries:', networkError);
          console.error('Original error payload:', payload);
        }
      }
    }
  }

  /**
   * Delay execution for specified milliseconds
   * 
   * @param ms - Milliseconds to delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create singleton instance
export const errorLogger = new ErrorLogger();

// Export types for use in other modules
export type { ErrorLogPayload, LogErrorOptions };
