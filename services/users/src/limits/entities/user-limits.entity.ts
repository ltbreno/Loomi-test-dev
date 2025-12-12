import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('user_limits')
export class UserLimits {
  @ApiProperty()
  @PrimaryColumn('uuid')
  userId: string;

  @ApiProperty({ description: 'Limite diário em reais' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1000 })
  dailyLimit: number;

  @ApiProperty({ description: 'Limite mensal em reais' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 10000 })
  monthlyLimit: number;

  @ApiProperty({ description: 'Limite por transação' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 5000 })
  transactionLimit: number;

  @ApiProperty({ description: 'Limite para transações internacionais' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 2000 })
  internationalLimit: number;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
