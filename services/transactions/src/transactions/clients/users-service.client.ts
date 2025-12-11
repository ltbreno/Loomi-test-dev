import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

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
  ) {
    this.usersServiceUrl = this.configService.get('USERS_SERVICE_URL') || 'http://localhost:3001';
  }

  async getUser(userId: string): Promise<User> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<User>(`${this.usersServiceUrl}/api/users/${userId}`),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'User service unavailable',
        error.response?.status || 503,
      );
    }
  }

  async getUserBalance(userId: string): Promise<UserBalance> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<UserBalance>(`${this.usersServiceUrl}/api/users/${userId}/balance`),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'User service unavailable',
        error.response?.status || 503,
      );
    }
  }

  async updateBalance(userId: string, amount: number, reason: string): Promise<User> {
    try {
      const response = await firstValueFrom(
        this.httpService.patch<User>(`${this.usersServiceUrl}/api/users/${userId}/balance`, {
          amount,
          reason,
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'User service unavailable',
        error.response?.status || 503,
      );
    }
  }
}
