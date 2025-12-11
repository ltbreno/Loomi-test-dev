import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheckResult,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Health check endpoint' })
  async check(): Promise<HealthCheckResult> {
    const usersServiceUrl = this.configService.get('USERS_SERVICE_URL') || 'http://localhost:3001';
    const transactionsServiceUrl =
      this.configService.get('TRANSACTIONS_SERVICE_URL') || 'http://localhost:3002';

    return this.health.check([
      () => this.http.pingCheck('users-service', `${usersServiceUrl}/health`),
      () => this.http.pingCheck('transactions-service', `${transactionsServiceUrl}/health`),
    ]);
  }
}
