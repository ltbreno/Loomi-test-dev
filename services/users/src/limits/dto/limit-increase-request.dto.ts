import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min, Max, Length } from 'class-validator';

export class LimitIncreaseRequestDto {
  @ApiProperty({
    description: 'Limite solicitado em reais',
    example: 15000,
    minimum: 1,
    maximum: 100000,
  })
  @IsNumber({}, { message: 'O limite solicitado deve ser um número' })
  @Min(1, { message: 'O limite deve ser no mínimo 1 real' })
  @Max(100000, { message: 'O limite solicitado não pode exceder 100.000 reais' })
  requestedLimit: number;

  @ApiProperty({
    description: 'Razão da solicitação de aumento',
    example: 'Aumento de salário e necessidade de maior limite para compras',
    minLength: 10,
    maxLength: 500,
  })
  @IsString({ message: 'A razão deve ser um texto' })
  @Length(10, 500, { message: 'A razão deve ter entre 10 e 500 caracteres' })
  reason: string;

  @ApiProperty({
    description: 'Tipo do limite a ser aumentado',
    enum: ['daily', 'monthly'],
    default: 'monthly',
    required: false,
  })
  @IsString({ message: 'O tipo deve ser uma string' })
  limitType?: 'daily' | 'monthly' = 'monthly';
}
