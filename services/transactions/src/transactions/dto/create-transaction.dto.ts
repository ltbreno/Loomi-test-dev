import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsString, IsNotEmpty, Min } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @IsUUID()
  senderUserId!: string;

  @ApiProperty({ example: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22' })
  @IsUUID()
  receiverUserId!: string;

  @ApiProperty({ example: 100.5, minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ example: 'Payment for services' })
  @IsString()
  @IsNotEmpty()
  description!: string;
}
