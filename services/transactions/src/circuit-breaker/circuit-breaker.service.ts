import { Injectable } from '@nestjs/common';
import CircuitBreaker = require('opossum');

@Injectable()
export class CircuitBreakerService {
  private readonly breakers = new Map<string, CircuitBreaker>();

  getBreaker(serviceName: string): CircuitBreaker {
    if (!this.breakers.has(serviceName)) {
      const breaker = new CircuitBreaker(
        async (fn: (...args: []) => Promise<unknown>, ...args: []) => {
          return await fn(...args);
        },
        {
          timeout: 5000, // Timeout de 5s por chamada
          errorThresholdPercentage: 50, // Abre se >50% das chamadas falham
          resetTimeout: 30000, // Tenta fechar após 30s
          rollingCountTimeout: 10000, // Janela de 10s para cálculo
          rollingCountBuckets: 10, // 10 buckets de 1s cada
          name: serviceName,
          cache: false,
        },
      );

      // Event listeners para monitoramento
      breaker.on('open', () => {
        console.log(`🔴 Circuit Breaker OPENED for ${serviceName}`);
      });

      breaker.on('close', () => {
        console.log(`🟢 Circuit Breaker CLOSED for ${serviceName}`);
      });

      breaker.on('halfOpen', () => {
        console.log(`🟡 Circuit Breaker HALF-OPEN for ${serviceName}`);
      });

      breaker.on('fallback', (result) => {
        console.log(`⚠️ Circuit Breaker FALLBACK triggered for ${serviceName}:`, result);
      });

      this.breakers.set(serviceName, breaker);
    }

    return this.breakers.get(serviceName)!;
  }

  getBreakerStats(serviceName: string): CircuitBreaker.Stats | null {
    const breaker = this.breakers.get(serviceName);
    return breaker ? breaker.stats : null;
  }
}
