import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { Transaction } from './entities/transaction.entity';
import { UsersServiceClient } from './clients/users-service.client';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    KafkaModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, UsersServiceClient],
  exports: [TransactionsService],
})
export class TransactionsModule {}
