import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { TransactionSummaryQueryDto } from './dto/transaction-summary.dto';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Dashboard financeiro completo do usuário',
    description: 'Retorna visão consolidada da saúde financeira do usuário',
  })
  async getDashboard(@Req() req) {
    return this.analyticsService.getUserDashboard(req.user.userId);
  }

  @Get('transactions/summary')
  @ApiOperation({
    summary: 'Resumo de transações por período',
    description: 'Estatísticas agregadas de transações com agrupamento flexível',
  })
  async getTransactionSummary(@Query() query: TransactionSummaryQueryDto, @Req() req) {
    return this.analyticsService.getTransactionSummary(
      req.user.userId,
      query.startDate,
      query.endDate,
      query.groupBy || 'month',
    );
  }

  @Get('spending/categories')
  @ApiOperation({
    summary: 'Análise de gastos por categoria',
    description: 'Categorização inteligente de despesas com insights',
  })
  async getSpendingByCategory(@Req() req) {
    return this.analyticsService.getSpendingByCategory(req.user.userId);
  }
}
