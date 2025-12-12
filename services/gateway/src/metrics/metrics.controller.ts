import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { metricsStore } from '@loomi/shared';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  private readonly transactionsServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.transactionsServiceUrl =
      this.configService.get('TRANSACTIONS_SERVICE_URL') || 'http://localhost:3002';
  }

  @Get()
  @ApiOperation({ summary: 'Get application metrics' })
  getMetrics() {
    return {
      timestamp: new Date().toISOString(),
      metrics: metricsStore.getMetrics(),
    };
  }

  @Get('circuit-breakers')
  @ApiOperation({
    summary: 'Get circuit breaker statistics',
    description: 'Aggregates circuit breaker stats from all services',
  })
  async getCircuitBreakerStats() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.transactionsServiceUrl}/circuit-breaker/stats`),
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch circuit breaker stats:', error.message);
      return {
        timestamp: new Date().toISOString(),
        error: 'Circuit breaker stats unavailable',
        services: ['transactions-service'],
      };
    }
  }
}
