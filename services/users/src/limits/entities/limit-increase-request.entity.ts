import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum LimitIncreaseStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

@Entity('limit_increase_requests')
export class LimitIncreaseRequest {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty()
  @Column('uuid')
  userId!: string;

  @ApiProperty({ description: 'Limite solicitado' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  requestedLimit!: number;

  @ApiProperty({ description: 'Tipo do limite (daily/monthly)' })
  @Column({ default: 'monthly' })
  limitType!: 'daily' | 'monthly';

  @ApiProperty({ description: 'Razão da solicitação' })
  @Column({ type: 'text' })
  reason!: string;

  @ApiProperty({ enum: LimitIncreaseStatus })
  @Column({
    type: 'enum',
    enum: LimitIncreaseStatus,
    default: LimitIncreaseStatus.PENDING,
  })
  status!: LimitIncreaseStatus;

  @ApiProperty({ description: 'Comentários do aprovador' })
  @Column({ type: 'text', nullable: true })
  reviewerComments?: string;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  reviewedBy?: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  reviewedAt?: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;
}
