import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserLimits } from './entities/user-limits.entity';
import {
  LimitIncreaseRequest,
  LimitIncreaseStatus,
} from './entities/limit-increase-request.entity';
import { LimitIncreaseRequestDto } from './dto/limit-increase-request.dto';
import { LimitsUsageDto } from './dto/limits-usage.dto';

@Injectable()
export class LimitsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserLimits)
    private limitsRepository: Repository<UserLimits>,
    @InjectRepository(LimitIncreaseRequest)
    private requestRepository: Repository<LimitIncreaseRequest>,
  ) {}

  async getUserLimits(userId: string): Promise<UserLimits> {
    let limits = await this.limitsRepository.findOne({ where: { userId } });

    if (!limits) {
      limits = await this.limitsRepository.save({
        userId,
        dailyLimit: 1000,
        monthlyLimit: 10000,
        transactionLimit: 5000,
        internationalLimit: 2000,
      });
    }

    return limits;
  }

  async getLimitsUsage(userId: string): Promise<LimitsUsageDto> {
    const limits = await this.getUserLimits(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const dailyUsage = await this.calculateDailyUsage(userId, today);
    const monthlyUsage = await this.calculateMonthlyUsage(userId, monthStart);

    return {
      daily: {
        used: dailyUsage,
        limit: limits.dailyLimit,
        remaining: Math.max(0, limits.dailyLimit - dailyUsage),
        percentage: limits.dailyLimit > 0 ? (dailyUsage / limits.dailyLimit) * 100 : 0,
      },
      monthly: {
        used: monthlyUsage,
        limit: limits.monthlyLimit,
        remaining: Math.max(0, limits.monthlyLimit - monthlyUsage),
        percentage: limits.monthlyLimit > 0 ? (monthlyUsage / limits.monthlyLimit) * 100 : 0,
      },
      transactionLimit: limits.transactionLimit,
      internationalLimit: limits.internationalLimit,
    };
  }

  async updateDailyLimit(userId: string, newLimit: number): Promise<UserLimits> {
    if (newLimit <= 0 || newLimit > 50000) {
      throw new BadRequestException('Limite diário deve estar entre 1 e 50.000 reais');
    }

    const limits = await this.getUserLimits(userId);

    if (newLimit > limits.monthlyLimit * 0.5) {
      throw new BadRequestException('Limite diário não pode exceder 50% do limite mensal');
    }

    limits.dailyLimit = newLimit;

    return this.limitsRepository.save(limits);
  }

  async updateMonthlyLimit(userId: string, newLimit: number): Promise<UserLimits> {
    if (newLimit <= 0 || newLimit > 50000) {
      throw new BadRequestException('Limite mensal deve estar entre 1 e 50.000 reais');
    }

    const limits = await this.getUserLimits(userId);
    if (newLimit <= limits.monthlyLimit) {
      throw new BadRequestException('Para reduzir o limite mensal, solicite aumento específico');
    }

    limits.monthlyLimit = newLimit;

    return this.limitsRepository.save(limits);
  }

  async requestLimitIncrease(
    userId: string,
    dto: LimitIncreaseRequestDto,
  ): Promise<{ requestId: string; status: string; message: string; expiresAt: Date | undefined }> {
    const existingRequest = await this.requestRepository.findOne({
      where: {
        userId,
        status: LimitIncreaseStatus.PENDING,
        createdAt: MoreThanOrEqual(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // Últimos 30 dias
      },
    });

    if (existingRequest) {
      throw new BadRequestException('Já existe uma solicitação pendente');
    }

    const currentLimits = await this.getUserLimits(userId);
    const maxAllowed = dto.limitType === 'daily' ? currentLimits.monthlyLimit * 0.5 : 50000;

    if (dto.requestedLimit > maxAllowed) {
      throw new BadRequestException(`Limite solicitado excede o máximo permitido (${maxAllowed})`);
    }

    const request = this.requestRepository.create({
      userId,
      requestedLimit: dto.requestedLimit,
      limitType: dto.limitType || 'monthly',
      reason: dto.reason,
      status: LimitIncreaseStatus.PENDING,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
    });

    const savedRequest = await this.requestRepository.save(request);

    return {
      requestId: savedRequest.id,
      status: 'PENDING',
      message: 'Solicitação criada. Você receberá uma notificação sobre a decisão.',
      expiresAt: savedRequest.expiresAt,
    };
  }

  async getLimitIncreaseRequests(userId: string): Promise<LimitIncreaseRequest[]> {
    return this.requestRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async approveLimitIncrease(
    requestId: string,
    reviewerId: string,
    comments?: string,
  ): Promise<LimitIncreaseRequest> {
    const request = await this.requestRepository.findOne({
      where: { id: requestId, status: LimitIncreaseStatus.PENDING },
    });

    if (!request) {
      throw new NotFoundException('Solicitação não encontrada ou já processada');
    }

    if (request.expiresAt && request.expiresAt < new Date()) {
      request.status = LimitIncreaseStatus.EXPIRED;
      await this.requestRepository.save(request);
      throw new BadRequestException('Solicitação expirada');
    }

    const limits = await this.getUserLimits(request.userId);
    if (request.limitType === 'daily') {
      limits.dailyLimit = request.requestedLimit;
    } else {
      limits.monthlyLimit = request.requestedLimit;
    }

    await this.limitsRepository.save(limits);

    request.status = LimitIncreaseStatus.APPROVED;
    request.reviewedBy = reviewerId;
    request.reviewedAt = new Date();
    request.reviewerComments = comments;

    return this.requestRepository.save(request);
  }

  async rejectLimitIncrease(
    requestId: string,
    reviewerId: string,
    comments?: string,
  ): Promise<LimitIncreaseRequest> {
    const request = await this.requestRepository.findOne({
      where: { id: requestId, status: LimitIncreaseStatus.PENDING },
    });

    if (!request) {
      throw new NotFoundException('Solicitação não encontrada');
    }

    request.status = LimitIncreaseStatus.REJECTED;
    request.reviewedBy = reviewerId;
    request.reviewedAt = new Date();
    request.reviewerComments = comments;

    return this.requestRepository.save(request);
  }

  private async calculateDailyUsage(userId: string, date: Date): Promise<number> {
    // Em produção, isso seria uma query real nas transações
    // SELECT SUM(amount) FROM transactions WHERE senderUserId = ? AND DATE(createdAt) = ?
    return Math.random() * 500; // Simulado
  }

  private async calculateMonthlyUsage(userId: string, monthStart: Date): Promise<number> {
    // Em produção, query real
    return Math.random() * 3000; // Simulado
  }
}
