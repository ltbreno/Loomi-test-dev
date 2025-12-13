import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { isAxiosError } from 'axios';
import { CreateUserRequest, UserProfile } from '@loomi/shared';

export interface TokenPayload {
  sub: string;
  email: string;
  type: 'access' | 'refresh';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly usersServiceUrl: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.usersServiceUrl = this.configService.get('USERS_SERVICE_URL') || 'http://localhost:3001';
  }

  async validateUser(email: string, password: string): Promise<UserProfile | null> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<UserProfile>(`${this.usersServiceUrl}/api/users/validate`, {
          email,
          password,
        }),
      );
      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 401) {
        return null;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error validating user:', message);
      return null;
    }
  }

  async login(user: UserProfile): Promise<AuthTokens> {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      type: 'access',
    };

    const refreshPayload: TokenPayload = {
      sub: user.id,
      email: user.email,
      type: 'refresh',
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async register(userData: CreateUserRequest): Promise<UserProfile> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<UserProfile>(`${this.usersServiceUrl}/api/users`, userData),
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify<TokenPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const newPayload: TokenPayload = {
        sub: payload.sub,
        email: payload.email,
        type: 'access',
      };

      const refreshPayload: TokenPayload = {
        sub: payload.sub,
        email: payload.email,
        type: 'refresh',
      };

      const accessToken = this.jwtService.sign(newPayload);

      const newRefreshToken = this.jwtService.sign(refreshPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
