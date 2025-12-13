import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AccountType, BankingDetails } from '@loomi/shared';

@Entity('users')
export class User {
  @ApiProperty({
    description: 'ID único do usuário',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
  })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao.silva@example.com',
    format: 'email',
  })
  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  email: string;

  @ApiProperty({
    description: 'Senha do usuário (não incluída nas respostas)',
    example: 'hashed_password_here',
    writeOnly: true,
  })
  @Column({ type: 'varchar' })
  @Exclude()
  password: string;

  @ApiProperty({
    description: 'Endereço do usuário',
    example: 'Rua das Flores, 123, São Paulo - SP',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  address: string;

  @ApiProperty({
    description: 'URL da foto de perfil do usuário',
    example: 'https://s3.amazonaws.com/bucket/profile-pictures/user-123.jpg',
    nullable: true,
  })
  @Column({ type: 'varchar', nullable: true })
  profilePicture: string;

  @ApiProperty({
    description: 'Dados bancários do usuário',
    type: 'object',
    properties: {
      agency: { type: 'string', example: '0001' },
      accountNumber: { type: 'string', example: '12345678' },
      accountType: { type: 'string', enum: ['CHECKING', 'SAVINGS'], example: 'CHECKING' },
    },
    nullable: true,
  })
  @Column({ type: 'jsonb', nullable: true })
  bankingDetails: BankingDetails | null;

  @ApiProperty({
    description: 'Saldo atual da conta do usuário',
    example: 1250.75,
    type: 'number',
    format: 'decimal',
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @ApiProperty({
    description: 'Indica se a conta do usuário está ativa',
    example: true,
    default: true,
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Data de criação da conta',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização da conta',
    example: '2024-01-20T14:45:00.000Z',
    format: 'date-time',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
