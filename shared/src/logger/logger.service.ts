import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';

export interface LogContext {
  correlationId?: string;
  userId?: string;
  service?: string;
  [key: string]: any;
}

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private context?: string;
  private staticContext: LogContext = {};

  setContext(context: string) {
    this.context = context;
  }

  setStaticContext(context: LogContext) {
    this.staticContext = { ...this.staticContext, ...context };
  }

  private formatMessage(level: string, message: any, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logContext = { ...this.staticContext, ...context };

    const logObject = {
      timestamp,
      level,
      context: this.context,
      message: typeof message === 'object' ? JSON.stringify(message) : message,
      ...logContext,
    };

    return JSON.stringify(logObject);
  }

  log(message: any, context?: LogContext) {
    console.log(this.formatMessage('INFO', message, context));
  }

  error(message: any, trace?: string, context?: LogContext) {
    console.error(this.formatMessage('ERROR', message, { ...context, trace }));
  }

  warn(message: any, context?: LogContext) {
    console.warn(this.formatMessage('WARN', message, context));
  }

  debug(message: any, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('DEBUG', message, context));
    }
  }

  verbose(message: any, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      console.log(this.formatMessage('VERBOSE', message, context));
    }
  }
}

