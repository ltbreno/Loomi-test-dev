import { ApiProperty } from '@nestjs/swagger';

export class TransactionSummaryDto {
  @ApiProperty()
  period: string;

  @ApiProperty()
  totalTransactions: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  income: number;

  @ApiProperty()
  expenses: number;

  @ApiProperty()
  netAmount: number;

  @ApiProperty()
  transactions: any[];
}

export class SpendingByCategoryDto {
  @ApiProperty()
  category: string;

  @ApiProperty()
  total: number;

  @ApiProperty()
  count: number;

  @ApiProperty()
  percentage: number;
}