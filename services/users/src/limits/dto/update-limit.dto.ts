import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max } from 'class-validator';

export class UpdateLimitDto {
  @ApiProperty({
    description: 'Novo valor do limite em reais',
    example: 5000,
    minimum: 1,
    maximum: 50000,
  })
  @IsNumber({}, { message: 'O limite deve ser um número' })
  @Min(1, { message: 'O limite deve ser no mínimo 1 real' })
  @Max(50000, { message: 'O limite não pode exceder 50.000 reais' })
  limit: number;
}
