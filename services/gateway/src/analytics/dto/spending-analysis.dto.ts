import { ApiProperty } from '@nestjs/swagger';

export class SpendingAnalysisDto {
  @ApiProperty()
  categories: SpendingByCategoryDto[];

  @ApiProperty()
  totalSpent: number;

  @ApiProperty()
  period: {
    startDate: Date;
    endDate: Date;
  };

  @ApiProperty()
  insights: string[];
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

  @ApiProperty()
  trend: 'up' | 'down' | 'stable';
}