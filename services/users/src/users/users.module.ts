import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { BalanceController } from './balance.controller';
import { UsersService } from './users.service';
import { S3Service } from './s3.service';
import { User } from './entities/user.entity';
import { CacheModule } from '../cache/cache.module';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CacheModule, KafkaModule],
  controllers: [UsersController, BalanceController],
  providers: [UsersService, S3Service],
  exports: [UsersService],
})
export class UsersModule {}
