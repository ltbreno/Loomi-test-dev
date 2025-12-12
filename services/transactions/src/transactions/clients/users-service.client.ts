import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CircuitBreakerService } from '../../circuit-breaker/circuit-breaker.service';
import { FallbackService } from '../../circuit-breaker/fallback.service';

export interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
}

export interface UserBalance {
  balance: number;
}

@Injectable()
export class UsersServiceClient {
  private readonly usersServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly fallbackService: FallbackService,
  ) {
    this.usersServiceUrl = this.configService.get('USERS_SERVICE_URL') || 'http://localhost:3001';
  }

  async getUser(userId: string): Promise<User> {
    const breaker = this.circuitBreakerService.getBreaker('users-service');

    try {
      return (await breaker.fire(async () => {
        const response = await firstValueFrom(
          this.httpService.get<User>(`${this.usersServiceUrl}/api/users/${userId}`),
        );
        return response.data;
      })) as User;
    } catch (error) {
      // Circuit está aberto ou request falhou
      if (error instanceof Error && error.message.includes('CircuitBreaker')) {
        // Fallback: assume usuário existe mas com dados mínimos
        console.log(`🚨 Circuit Breaker OPEN for users-service. Using fallback for user ${userId}`);
        return {
          id: userId,
          name: 'Unknown User',
          email: 'unknown@example.com',
          balance: 0,
        } as User;
      }
      throw error;
    }
  }

  async getUserBalance(userId: string): Promise<UserBalance> {
    const breaker = this.circuitBreakerService.getBreaker('users-service');

    try {
      return (await breaker.fire(async () => {
        const response = await firstValueFrom(
          this.httpService.get<UserBalance>(`${this.usersServiceUrl}/api/users/${userId}/balance`),
        );
        return response.data;
      })) as UserBalance;
    } catch (error) {
      // Fallback: assume saldo zero (conservador)
      console.log(
        `🚨 Circuit Breaker OPEN for users-service. Using fallback balance for user ${userId}`,
      );
      return { balance: 0 };
    }
  }

  async updateBalance(userId: string, amount: number, reason: string): Promise<User> {
    const breaker = this.circuitBreakerService.getBreaker('users-service');

    try {
      return (await breaker.fire(async () => {
        const response = await firstValueFrom(
          this.httpService.patch<User>(`${this.usersServiceUrl}/api/users/${userId}/balance`, {
            amount,
            reason,
          }),
        );
        return response.data;
      })) as User;
    } catch (error) {
      // Fallback: registra operação para processamento posterior
      console.log(
        `🚨 Circuit Breaker OPEN for users-service. Queuing balance update for user ${userId}`,
      );
      return this.fallbackService.updateBalanceFallback(userId, amount, reason) as unknown as User;
    }
  }
}
