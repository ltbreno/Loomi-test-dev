import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let httpService: HttpService;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('signed-token'),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                USERS_SERVICE_URL: 'http://localhost:3001',
                JWT_SECRET: 'test-secret',
                JWT_EXPIRES_IN: '15m',
                JWT_REFRESH_SECRET: 'test-refresh-secret',
                JWT_REFRESH_EXPIRES_IN: '7d',
              };
              return config[key];
            }),
          },
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access and refresh tokens', async () => {
      const result = await service.login(mockUser);

      expect(result).toEqual({
        accessToken: 'signed-token',
        refreshToken: 'signed-token',
      });
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      jest.spyOn(httpService, 'post').mockReturnValue(of({ data: mockUser } as any));

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toEqual(mockUser);
    });

    it('should return null if credentials are invalid', async () => {
      jest.spyOn(httpService, 'post').mockReturnValue(
        of({
          data: null,
        } as any),
      );

      const result = await service.validateUser('test@example.com', 'wrong-password');

      expect(result).toBeNull();
    });
  });
});
