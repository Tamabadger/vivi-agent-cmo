/**
 * Comprehensive logging utility for ViVi CMO Agent
 * Supports multiple log levels, structured logging, and performance monitoring
 */

export interface LogContext {
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: LogContext;
  error?: Error;
  performance?: {
    duration: number;
    memory: number;
    cpu: number;
  };
}

class Logger {
  private logLevel: string;
  private isDevelopment: boolean;

  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      this.log('debug', message, context);
    }
  }

  /**
   * Log an info message
   */
  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      this.log('info', message, context);
    }
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      this.log('warn', message, context);
    }
  }

  /**
   * Log an error message
   */
  error(message: string, context?: LogContext, error?: Error): void {
    if (this.shouldLog('error')) {
      this.log('error', message, context, error);
    }
  }

  /**
   * Log a critical error message
   */
  critical(message: string, context?: LogContext, error?: Error): void {
    if (this.shouldLog('critical')) {
      this.log('critical', message, context, error);
    }
  }

  /**
   * Log performance metrics
   */
  performance(message: string, duration: number, context?: LogContext): void {
    if (this.shouldLog('info')) {
      const performanceContext = {
        ...context,
        performance: {
          duration,
          memory: this.getMemoryUsage(),
          cpu: this.getCpuUsage()
        }
      };
      this.log('info', message, performanceContext);
    }
  }

  /**
   * Log API request/response
   */
  api(level: string, message: string, context?: LogContext): void {
    if (this.shouldLog(level)) {
      this.log(level, `[API] ${message}`, context);
    }
  }

  /**
   * Log database operations
   */
  database(level: string, message: string, context?: LogContext): void {
    if (this.shouldLog(level)) {
      this.log(level, `[DB] ${message}`, context);
    }
  }

  /**
   * Log AI operations
   */
  ai(level: string, message: string, context?: LogContext): void {
    if (this.shouldLog(level)) {
      this.log(level, `[AI] ${message}`, context);
    }
  }

  /**
   * Log security events
   */
  security(level: string, message: string, context?: LogContext): void {
    if (this.shouldLog(level)) {
      this.log(level, `[SECURITY] ${message}`, context);
    }
  }

  /**
   * Log business metrics
   */
  metrics(message: string, metrics: Record<string, number>, context?: LogContext): void {
    if (this.shouldLog('info')) {
      const metricsContext = {
        ...context,
        metrics
      };
      this.log('info', `[METRICS] ${message}`, metricsContext);
    }
  }

  /**
   * Check if a log level should be logged
   */
  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error', 'critical'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Internal logging method
   */
  private log(level: string, message: string, context?: LogContext, error?: Error): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error
    };

    // Format the log entry
    const formattedLog = this.formatLogEntry(logEntry);
    
    // Output to console in development
    if (this.isDevelopment) {
      this.outputToConsole(logEntry);
    }
    
    // In production, this would send to a logging service
    this.outputToService(logEntry);
  }

  /**
   * Format log entry for output
   */
  private formatLogEntry(entry: LogEntry): string {
    const parts = [
      `[${entry.timestamp}]`,
      entry.level.toUpperCase(),
      entry.message
    ];

    if (entry.context && Object.keys(entry.context).length > 0) {
      parts.push(JSON.stringify(entry.context));
    }

    if (entry.error) {
      parts.push(`Error: ${entry.error.message}`);
      if (this.isDevelopment && entry.error.stack) {
        parts.push(`Stack: ${entry.error.stack}`);
      }
    }

    return parts.join(' ');
  }

  /**
   * Output to console (development)
   */
  private outputToConsole(entry: LogEntry): void {
    const method = this.getConsoleMethod(entry.level);
    const formatted = this.formatLogEntry(entry);
    
    method(formatted);
  }

  /**
   * Get appropriate console method for log level
   */
  private getConsoleMethod(level: string): (...args: any[]) => void {
    switch (level) {
      case 'debug':
        return console.debug;
      case 'info':
        return console.info;
      case 'warn':
        return console.warn;
      case 'error':
      case 'critical':
        return console.error;
      default:
        return console.log;
    }
  }

  /**
   * Output to logging service (production)
   */
  private outputToService(entry: LogEntry): void {
    // In production, this would send to:
    // - CloudWatch (AWS)
    // - DataDog
    // - New Relic
    // - Custom logging service
    
    // For now, just store in memory (not recommended for production)
    this.storeLogEntry(entry);
  }

  /**
   * Store log entry in memory (temporary)
   */
  private storeLogEntry(entry: LogEntry): void {
    // This is a simple in-memory store for development
    // In production, use proper logging infrastructure
    if (!(global as any).logStore) {
      (global as any).logStore = [];
    }
    
    (global as any).logStore.push(entry);
    
    // Keep only last 1000 entries
    if ((global as any).logStore.length > 1000) {
      (global as any).logStore = (global as any).logStore.slice(-1000);
    }
  }

  /**
   * Get memory usage
   */
  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }

  /**
   * Get CPU usage (simplified)
   */
  private getCpuUsage(): number {
    // In a real implementation, this would track CPU usage over time
    return 0;
  }

  /**
   * Get stored logs (for debugging)
   */
  getStoredLogs(): LogEntry[] {
    return (global as any).logStore || [];
  }

  /**
   * Clear stored logs
   */
  clearStoredLogs(): void {
    (global as any).logStore = [];
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): Logger {
    const childLogger = new Logger();
    
    // Override the log method to include parent context
    const originalLog = childLogger.log.bind(childLogger);
    childLogger.log = (level: string, message: string, childContext?: LogContext, error?: Error) => {
      const mergedContext = { ...context, ...childContext };
      originalLog(level, message, mergedContext, error);
    };
    
    return childLogger;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export Logger class for custom instances
export { Logger };

// Export convenience functions
export const debug = (message: string, context?: LogContext) => logger.debug(message, context);
export const info = (message: string, context?: LogContext) => logger.info(message, context);
export const warn = (message: string, context?: LogContext) => logger.warn(message, context);
export const error = (message: string, context?: LogContext, err?: Error) => logger.error(message, context, err);
export const critical = (message: string, context?: LogContext, err?: Error) => logger.critical(message, context, err);
export const performance = (message: string, duration: number, context?: LogContext) => logger.performance(message, duration, context);
export const api = (level: string, message: string, context?: LogContext) => logger.api(level, message, context);
export const database = (level: string, message: string, context?: LogContext) => logger.database(level, message, context);
export const ai = (level: string, message: string, context?: LogContext) => logger.ai(level, message, context);
export const security = (level: string, message: string, context?: LogContext) => logger.security(level, message, context);
export const metrics = (message: string, metrics: Record<string, number>, context?: LogContext) => logger.metrics(message, metrics, context);
