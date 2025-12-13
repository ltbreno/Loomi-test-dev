import { ApiProperty } from '@nestjs/swagger';
import {
  UserData,
  TransactionData,
  MonthlySummary,
  SpendingTrend,
  LimitsUsage,
} from '../types/analytics.types';

export class DashboardDto {
  @ApiProperty({ description: 'Dados do usuário' })
  user!: UserData;

  @ApiProperty({ description: 'Saldo atual da conta' })
  balance!: { balance: number; currency?: string };

  @ApiProperty({ description: 'Últimas 5 transações', type: [Object] })
  recentTransactions!: TransactionData[];

  @ApiProperty({ description: 'Resumo financeiro do mês atual' })
  monthlySummary!: MonthlySummary;

  @ApiProperty({ description: 'Tendências de gastos dos últimos 6 meses', type: [Object] })
  spendingTrends!: SpendingTrend[];

  @ApiProperty({ description: 'Uso atual vs limites de conta' })
  limits!: LimitsUsage;
}
