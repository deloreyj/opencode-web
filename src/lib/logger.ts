/**
 * Logger utility that writes to console in local dev and to file in container
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.info('Something happened', { data: 'value' });
 *   logger.error('Error occurred', error);
 */

import * as fs from 'fs';
import * as path from 'path';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

class Logger {
  private logFilePath: string | null = null;
  private isContainer: boolean = false;

  constructor() {
    // Detect if running in container by checking environment
    // In container, OPENCODE_URL will be localhost, in dev it will be from env
    this.isContainer = !!(typeof process !== 'undefined' &&
                      (process.env.CONTAINER_MODE === 'true' ||
                       process.env.OPENCODE_URL?.includes('localhost:4096')));

    if (this.isContainer) {
      // In container, write to /workspace/logs directory
      const logsDir = '/workspace/logs';
      try {
        if (!fs.existsSync(logsDir)) {
          fs.mkdirSync(logsDir, { recursive: true });
        }
        this.logFilePath = path.join(logsDir, `worker-${Date.now()}.log`);
        this.writeToFile(`=== Logger initialized in container mode ===\n`);
      } catch (error) {
        // Fall back to console if file writing fails
        console.error('[Logger] Failed to initialize file logging:', error);
        this.logFilePath = null;
      }
    }
  }

  private writeToFile(content: string) {
    if (this.logFilePath) {
      try {
        fs.appendFileSync(this.logFilePath, content);
      } catch (error) {
        // Silent fail - don't break the app if logging fails
        console.error('[Logger] Failed to write to file:', error);
      }
    }
  }

  private formatLogEntry(level: LogLevel, message: string, data?: any): string {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };

    // Format as JSON for file, human-readable for console
    if (this.isContainer && this.logFilePath) {
      return JSON.stringify(entry) + '\n';
    }

    // Console format
    let formatted = `[${entry.timestamp}] [${level.toUpperCase()}] ${message}`;
    if (data !== undefined) {
      formatted += ` ${typeof data === 'object' ? JSON.stringify(data, null, 2) : data}`;
    }
    return formatted;
  }

  private log(level: LogLevel, message: string, data?: any) {
    const formatted = this.formatLogEntry(level, message, data);

    if (this.isContainer && this.logFilePath) {
      // In container: write to file AND console
      this.writeToFile(formatted);
      console.log(formatted); // Also log to console for immediate visibility
    } else {
      // In local dev: console only
      switch (level) {
        case 'debug':
          console.debug(formatted);
          break;
        case 'info':
          console.info(formatted);
          break;
        case 'warn':
          console.warn(formatted);
          break;
        case 'error':
          console.error(formatted);
          break;
      }
    }
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  /**
   * Get the current log file path (container only)
   */
  getLogFilePath(): string | null {
    return this.logFilePath;
  }
}

// Export singleton instance
export const logger = new Logger();
