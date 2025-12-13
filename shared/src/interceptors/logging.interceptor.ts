import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';

type HttpRequestWithCorrelation = Request & {
  correlationId?: string;
  headers: Request['headers'] & { 'x-correlation-id'?: string | string[] };
};

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<HttpRequestWithCorrelation>();
    const { method, url, headers } = request;
    const correlationHeader = headers['x-correlation-id'];
    const correlationId = Array.isArray(correlationHeader)
      ? correlationHeader[0] ?? uuidv4()
      : correlationHeader || uuidv4();

    // Add correlation ID to request
    request.correlationId = correlationId;

    const startTime = Date.now();

    this.logger.log({
      message: 'Incoming request',
      method,
      url,
      correlationId,
    });

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const response = context.switchToHttp().getResponse<Response>();

          this.logger.log({
            message: 'Request completed',
            method,
            url,
            statusCode: response.statusCode,
            duration: `${duration}ms`,
            correlationId,
          });
        },
        error: (error: unknown) => {
          const duration = Date.now() - startTime;
          const errorMessage = error instanceof Error ? error.message : String(error);
          const errorStack = error instanceof Error ? error.stack : undefined;

          this.logger.error({
            message: 'Request failed',
            method,
            url,
            error: errorMessage,
            stack: errorStack,
            duration: `${duration}ms`,
            correlationId,
          });
        },
      }),
    );
  }
}

