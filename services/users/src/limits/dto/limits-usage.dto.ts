import { ApiProperty } from '@nestjs/swagger';

export class LimitsUsageDto {
  @ApiProperty({ description: 'Informações de uso do limite diário' })
  daily!: {
    used: number;
    limit: number;
    remaining: number;
    percentage: number;
  };

  @ApiProperty({ description: 'Informações de uso do limite mensal' })
  monthly!: {
    used: number;
    limit: number;
    remaining: number;
    percentage: number;
  };

  @ApiProperty({ description: 'Limite por transação individual' })
  transactionLimit!: number;

  @ApiProperty({ description: 'Limite para transações internacionais' })
  internationalLimit!: number;
}

export class LimitIncreaseRequestResponseDto {
  @ApiProperty({ description: 'ID da solicitação' })
  requestId!: string;

  @ApiProperty({ description: 'Limite solicitado' })
  requestedLimit!: number;

  @ApiProperty({ description: 'Tipo do limite' })
  limitType!: 'daily' | 'monthly';

  @ApiProperty({ description: 'Razão da solicitação' })
  reason!: string;

  @ApiProperty({
    description: 'Status da solicitação',
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'],
  })
  status!: string;

  @ApiProperty({ description: 'Data de criação' })
  createdAt!: Date;

  @ApiProperty({ description: 'Comentários do revisor', required: false })
  reviewerComments?: string;

  @ApiProperty({ description: 'Data de expiração', required: false })
  expiresAt?: Date;
}
