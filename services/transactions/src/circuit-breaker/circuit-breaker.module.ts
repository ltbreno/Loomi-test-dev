import { Module } from '@nestjs/common';
import { CircuitBreakerService } from './circuit-breaker.service';
import { FallbackService } from './fallback.service';

@Module({
  providers: [CircuitBreakerService, FallbackService],
  exports: [CircuitBreakerService, FallbackService],
})
export class CircuitBreakerModule {}
