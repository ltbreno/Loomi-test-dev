import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  MinLength,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AccountType } from '@loomi/shared';

class BankingDetailsDto {
  @ApiProperty({
    description: 'Agência bancária',
    example: '0001',
  })
  @IsString()
  @IsNotEmpty()
  agency: string;

  @ApiProperty({
    description: 'Número da conta',
    example: '12345678',
  })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty({
    description: 'Tipo da conta',
    enum: AccountType,
    example: AccountType.CHECKING,
  })
  @IsEnum(AccountType)
  accountType: AccountType;
}

export class RegisterDto {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao.silva@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'SecurePassword123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Endereço do usuário',
    example: 'Rua das Flores, 123, São Paulo - SP',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Dados bancários do usuário',
    type: BankingDetailsDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => BankingDetailsDto)
  @IsOptional()
  bankingDetails?: BankingDetailsDto;
}
