import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CircuitBreakerService } from './circuit-breaker.service';

@ApiTags('circuit-breaker')
@Controller('circuit-breaker')
export class CircuitBreakerController {
  constructor(private readonly circuitBreakerService: CircuitBreakerService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Estatísticas de todos os circuit breakers',
    description: 'Retorna estatísticas de saúde de todos os circuit breakers ativos',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas retornadas com sucesso',
    schema: {
      type: 'object',
      properties: {
        timestamp: { type: 'string', format: 'date-time' },
        stats: {
          type: 'object',
          additionalProperties: {
            type: 'object',
            properties: {
              failures: { type: 'number' },
              successes: { type: 'number' },
              timeouts: { type: 'number' },
              pending: { type: 'number' },
              state: { type: 'string', enum: ['closed', 'open', 'halfOpen'] },
              opened: { type: 'boolean' },
              halfOpen: { type: 'boolean' },
              closed: { type: 'boolean' },
            },
          },
        },
      },
    },
  })
  getAllStats() {
    const services = ['users-service', 'notifications-service', 'analytics-service'];
    const stats: Record<string, unknown> = {};

    services.forEach((service) => {
      stats[service] = this.circuitBreakerService.getBreakerStats(service);
    });

    return {
      timestamp: new Date().toISOString(),
      stats,
    };
  }

  @Get('stats/:service')
  @ApiOperation({
    summary: 'Estatísticas de um circuit breaker específico',
    description: 'Retorna estatísticas detalhadas de um circuit breaker específico',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas do serviço retornadas com sucesso',
    schema: {
      type: 'object',
      properties: {
        service: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
        stats: {
          type: 'object',
          nullable: true,
          properties: {
            failures: { type: 'number' },
            successes: { type: 'number' },
            timeouts: { type: 'number' },
            pending: { type: 'number' },
            state: { type: 'string', enum: ['closed', 'open', 'halfOpen'] },
            opened: { type: 'boolean' },
            halfOpen: { type: 'boolean' },
            closed: { type: 'boolean' },
          },
        },
      },
    },
  })
  getServiceStats(@Param('service') service: string) {
    return {
      service,
      timestamp: new Date().toISOString(),
      stats: this.circuitBreakerService.getBreakerStats(service),
    };
  }
}
