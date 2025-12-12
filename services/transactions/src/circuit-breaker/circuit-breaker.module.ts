import { Module } from '@nestjs/common';
import { CircuitBreakerService } from './circuit-breaker.service';
import { FallbackService } from './fallback.service';
import { CircuitBreakerController } from './circuit-breaker.controller';

@Module({
  providers: [CircuitBreakerService, FallbackService],
  controllers: [CircuitBreakerController],
  exports: [CircuitBreakerService, FallbackService],
})
export class CircuitBreakerModule {}
