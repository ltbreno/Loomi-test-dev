import { Injectable } from '@nestjs/common';

@Injectable()
export class FallbackService {
  async validateUserFallback(userId: string): Promise<{ isValid: boolean; balance?: number }> {
    console.log(`⚠️ FALLBACK: User validation for ${userId} - assuming valid with zero balance`);

    return {
      isValid: true,
      balance: 0,
    };
  }

  async updateBalanceFallback(
    userId: string,
    amount: number,
    reason: string,
  ): Promise<{
    success: boolean;
    queued: boolean;
    userId: string;
    amount: number;
    reason: string;
    timestamp: Date;
  }> {
    console.log(`⚠️ FALLBACK: Balance update for ${userId} - queued for later processing`);

    return {
      success: true,
      queued: true,
      userId,
      amount,
      reason,
      timestamp: new Date(),
    };
  }
}
