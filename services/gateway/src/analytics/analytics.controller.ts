import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Dashboard financeiro completo do usuário',
    description: 'Retorna visão consolidada da saúde financeira do usuário'
  })
  async getDashboard(@Req() req) {
    return this.analyticsService.getUserDashboard(req.user.userId);
  }

  @Get('transactions/summary')
  @ApiOperation({
    summary: 'Resumo de transações por período',
    description: 'Estatísticas agregadas de transações com agrupamento flexível'
  })
  @ApiQuery({ name: 'startDate', required: true, type: Date })
  @ApiQuery({ name: 'endDate', required: true, type: Date })
  @ApiQuery({ name: 'groupBy', enum: ['day', 'month', 'category'], required: false })
  async getTransactionSummary(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Query('groupBy') groupBy: 'day' | 'month' | 'category' = 'month',
    @Req() req
  ) {
    return this.analyticsService.getTransactionSummary(
      req.user.userId,
      startDate,
      endDate,
      groupBy
    );
  }

  @Get('spending/categories')
  @ApiOperation({
    summary: 'Análise de gastos por categoria',
    description: 'Categorização inteligente de despesas com insights'
  })
  async getSpendingByCategory(@Req() req) {
    return this.analyticsService.getSpendingByCategory(req.user.userId);
  }
}