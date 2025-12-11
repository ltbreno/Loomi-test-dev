import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { metricsStore } from '@loomi/shared';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  @Get()
  @ApiOperation({ summary: 'Get application metrics' })
  getMetrics() {
    return {
      timestamp: new Date().toISOString(),
      metrics: metricsStore.getMetrics(),
    };
  }
}
