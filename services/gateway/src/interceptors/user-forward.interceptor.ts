import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

interface AuthenticatedRequest {
  headers: Record<string, string>;
  user?: {
    userId: string;
    email: string;
  };
}

@Injectable()
export class UserForwardInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (request.user) {
      request.headers['x-user-id'] = request.user.userId;
      request.headers['x-user-email'] = request.user.email;
    }

    return next.handle();
  }
}
