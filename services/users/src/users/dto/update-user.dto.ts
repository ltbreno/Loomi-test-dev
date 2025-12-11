import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { AccountType } from '@loomi/shared';

class BankingDetailsDto {
  @ApiProperty({ example: '0001', required: false })
  @IsString()
  @IsOptional()
  agency?: string;

  @ApiProperty({ example: '12345678', required: false })
  @IsString()
  @IsOptional()
  accountNumber?: string;

  @ApiProperty({ enum: AccountType, example: AccountType.CHECKING, required: false })
  @IsEnum(AccountType)
  @IsOptional()
  accountType?: AccountType;
}

export class UpdateUserDto {
  @ApiProperty({ example: 'João Silva', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'joao.silva@example.com', required: false })
  @IsString()
  @IsOptional()
  email?: string;

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
