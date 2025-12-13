import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';

export type LogContextValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, unknown>;

export interface LogContext {
  correlationId?: string;
  userId?: string;
  service?: string;
  [key: string]: LogContextValue;
}

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private context?: string;
  private staticContext: LogContext = {};

  private formatValue(value: unknown): string {
    if (value instanceof Error) {
      return value.stack ?? value.message;
    }

    if (typeof value === 'object' && value !== null) {
      try {
        return JSON.stringify(value);
      } catch (error) {
        return '[Unserializable object]';
      }
    }

    return String(value);
  }

  setContext(context: string) {
    this.context = context;
  }

  setStaticContext(context: LogContext) {
    this.staticContext = { ...this.staticContext, ...context };
  }

  private formatMessage(level: string, message: unknown, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logContext = { ...this.staticContext, ...context };

    const logObject = {
      timestamp,
      level,
      context: this.context,
      message: this.formatValue(message),
      ...logContext,
    };

    return JSON.stringify(logObject);
  }

  log(message: unknown, context?: LogContext) {
    console.log(this.formatMessage('INFO', message, context));
  }

  error(message: unknown, trace?: string, context?: LogContext) {
    console.error(this.formatMessage('ERROR', message, { ...context, trace }));
  }

  warn(message: unknown, context?: LogContext) {
    console.warn(this.formatMessage('WARN', message, context));
  }

  debug(message: unknown, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('DEBUG', message, context));
    }
  }

  verbose(message: unknown, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      console.log(this.formatMessage('VERBOSE', message, context));
    }
  }
}

