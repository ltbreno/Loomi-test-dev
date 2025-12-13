import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TransactionData } from '../types/analytics.types';

export class TransactionSummaryDto {
  @ApiProperty()
  period!: string;

  @ApiProperty()
  totalTransactions!: number;

  @ApiProperty()
  totalAmount!: number;

  @ApiProperty()
  income!: number;

  @ApiProperty()
  expenses!: number;

  @ApiProperty()
  netAmount!: number;

  @ApiProperty()
  transactions!: TransactionData[];
}

export class SpendingByCategoryDto {
  @ApiProperty()
  category!: string;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  count!: number;

  @ApiProperty()
  percentage!: number;
}

export class TransactionSummaryQueryDto {
  @ApiProperty({ description: 'Data inicial (YYYY-MM-DD)' })
  @Type(() => Date)
  startDate!: Date;

  @ApiProperty({ description: 'Data final (YYYY-MM-DD)' })
  @Type(() => Date)
  endDate!: Date;

  @ApiProperty({
    description: 'Tipo de agrupamento',
    enum: ['day', 'month', 'category'],
    required: false,
  })
  groupBy?: 'day' | 'month' | 'category';
}
