import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AccountType } from '@loomi/shared';

class BankingDetailsDto {
  @ApiProperty({ example: '0001' })
  @IsString()
  @IsNotEmpty()
  agency!: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  accountNumber!: string;

  @ApiProperty({ enum: AccountType, example: AccountType.CHECKING })
  @IsEnum(AccountType)
  accountType!: AccountType;
}

export class CreateUserDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'joao.silva@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecurePassword123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Rua das Flores, 123, São Paulo - SP', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ type: BankingDetailsDto, required: false })
  @ValidateNested()
  @Type(() => BankingDetailsDto)
  @IsOptional()
  bankingDetails?: BankingDetailsDto;
}
