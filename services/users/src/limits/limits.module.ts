import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LimitsController } from './limits.controller';
import { LimitsService } from './limits.service';
import { UserLimits } from './entities/user-limits.entity';
import { LimitIncreaseRequest } from './entities/limit-increase-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserLimits, LimitIncreaseRequest])
  ],
  controllers: [LimitsController],
  providers: [LimitsService],
  exports: [LimitsService]
})
export class LimitsModule {}