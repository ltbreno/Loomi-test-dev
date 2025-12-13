import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

type MetricsSnapshot = Record<string, number>;
type HttpRequestWithRoute = Request & { route?: { path?: string } };

// Simple in-memory metrics storage
// In production, use Prometheus or similar
class MetricsStore {
  private metrics = new Map<string, number>();
  private histogram = new Map<string, number[]>();

  increment(key: string, value: number = 1) {
    const current = this.metrics.get(key) || 0;
    this.metrics.set(key, current + value);
  }

  recordDuration(key: string, duration: number) {
    const durations = this.histogram.get(key) || [];
    durations.push(duration);
    this.histogram.set(key, durations);
  }

  getMetrics(): MetricsSnapshot {
    const result: MetricsSnapshot = {};

    // Convert metrics to object
    this.metrics.forEach((value, key) => {
      result[key] = value;
    });

    // Calculate histogram statistics
    this.histogram.forEach((durations, key) => {
      const sorted = durations.sort((a, b) => a - b);
      const sum = sorted.reduce((a, b) => a + b, 0);
      const avg = sum / sorted.length;
      const p50 = sorted[Math.floor(sorted.length * 0.5)];
      const p95 = sorted[Math.floor(sorted.length * 0.95)];
      const p99 = sorted[Math.floor(sorted.length * 0.99)];

      result[`${key}_avg`] = Number(avg.toFixed(2));
      result[`${key}_p50`] = p50;
      result[`${key}_p95`] = p95;
      result[`${key}_p99`] = p99;
    });

    return result;
  }

  reset() {
    this.metrics.clear();
    this.histogram.clear();
  }
}

export const metricsStore = new MetricsStore();

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<HttpRequestWithRoute>();
    const { method, route } = request;
    const startTime = Date.now();

    const metricKey = `http_requests_${method}_${route?.path || 'unknown'}`;

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          metricsStore.increment(`${metricKey}_total`);
          metricsStore.increment(`${metricKey}_success`);
          metricsStore.recordDuration(`${metricKey}_duration`, duration);
        },
        error: () => {
          const duration = Date.now() - startTime;
          metricsStore.increment(`${metricKey}_total`);
          metricsStore.increment(`${metricKey}_error`);
          metricsStore.recordDuration(`${metricKey}_duration`, duration);
        },
      }),
    );
  }
}

