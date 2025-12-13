import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { TransactionMetadata, TransactionStatus, TransactionType } from '@loomi/shared';
import { ApiProperty } from '@nestjs/swagger';

@Entity('transactions')
export class Transaction {
  @ApiProperty({
    description: 'ID único da transação',
    example: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID do usuário que envia a transação',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @Column({ type: 'uuid' })
  @Index()
  senderUserId: string;

  @ApiProperty({
    description: 'ID do usuário que recebe a transação',
    example: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  })
  @Column({ type: 'uuid' })
  @Index()
  receiverUserId: string;

  @ApiProperty({
    description: 'Valor da transação',
    example: 100.5,
    type: 'number',
    format: 'decimal',
    minimum: 0.01,
  })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @ApiProperty({
    description: 'Descrição da transação',
    example: 'Pagamento por serviços de consultoria',
    maxLength: 500,
  })
  @Column({ type: 'varchar', length: 500 })
  description: string;

  @ApiProperty({
    description: 'Status atual da transação',
    enum: TransactionStatus,
    example: TransactionStatus.COMPLETED,
    default: TransactionStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  @Index()
  status: TransactionStatus;

  @ApiProperty({
    description: 'Tipo da transação',
    enum: TransactionType,
    example: TransactionType.TRANSFER,
    default: TransactionType.TRANSFER,
  })
  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.TRANSFER,
  })
  type: TransactionType;

  @ApiProperty({
    description: 'Metadados adicionais da transação',
    type: 'object',
    example: { referenceId: 'REF123', category: 'services' },
    nullable: true,
  })
  @Column({ type: 'jsonb', nullable: true })
  metadata: TransactionMetadata | null;

  @ApiProperty({
    description: 'Data de criação da transação',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Data de processamento da transação',
    example: '2024-01-15T10:30:05.000Z',
    format: 'date-time',
  })
  @UpdateDateColumn()
  @Index()
  processedAt: Date;
}
