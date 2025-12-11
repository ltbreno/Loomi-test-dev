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

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, headers } = request;
    const correlationId = headers['x-correlation-id'] || uuidv4();

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
          const response = context.switchToHttp().getResponse();

          this.logger.log({
            message: 'Request completed',
            method,
            url,
            statusCode: response.statusCode,
            duration: `${duration}ms`,
            correlationId,
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;

          this.logger.error({
            message: 'Request failed',
            method,
            url,
            error: error.message,
            stack: error.stack,
            duration: `${duration}ms`,
            correlationId,
          });
        },
      }),
    );
  }
}

