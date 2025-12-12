import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { getRepositoryToken } from '@nestjs/typeorm';
import request = require('supertest');
import { TransactionsModule } from '../src/transactions/transactions.module';
import { Transaction } from '../src/transactions/entities/transaction.entity';
import { CircuitBreakerService } from '../src/circuit-breaker/circuit-breaker.service';
import { UsersServiceClient } from '../src/transactions/clients/users-service.client';

describe('Circuit Breaker Integration (e2e)', () => {
  let app: INestApplication;
  let circuitBreakerService: CircuitBreakerService;
  let httpService: HttpService;
  let usersServiceClient: UsersServiceClient;

  const mockTransaction = {
    senderUserId: 'user-1',
    receiverUserId: 'user-2',
    amount: 100,
    description: 'Test transaction',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TransactionsModule],
    })
      .overrideProvider(getRepositoryToken(Transaction))
      .useValue({
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    circuitBreakerService = moduleFixture.get(CircuitBreakerService);
    httpService = moduleFixture.get(HttpService);
    usersServiceClient = moduleFixture.get(UsersServiceClient);

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Circuit Breaker Resilience', () => {
    it('should handle users service failure gracefully', async () => {
      // Mock users service failure
      jest
        .spyOn(usersServiceClient, 'getUser')
        .mockRejectedValue(new Error('Circuit Breaker: users-service is OPEN'));
      jest
        .spyOn(usersServiceClient, 'getUserBalance')
        .mockRejectedValue(new Error('Circuit Breaker: users-service is OPEN'));

      // Try to create transaction - should use fallback
      const response = await request(app.getHttpServer())
        .post('/transactions')
        .send(mockTransaction)
        .expect(400); // Should fail with validation error, not service unavailable

      expect(response.body.message).toContain('User validation unavailable');
    });

    it('should open circuit breaker after multiple failures', async () => {
      // Mock consistent failures
      const mockError = new Error('Service unavailable');
      jest.spyOn(httpService, 'get').mockRejectedValue(mockError as never);

      // Make multiple calls to trigger circuit opening
      for (let i = 0; i < 10; i++) {
        try {
          await usersServiceClient.getUser('user-1');
        } catch (error) {
          // Expected to fail
        }
      }

      // Check if circuit is open
      const stats = circuitBreakerService.getBreakerStats('users-service');
      expect(stats).toBeDefined();
      // Circuit should be open or half-open after failures
      expect(stats?.failures).toBeGreaterThan(0);
    });

    it('should provide circuit breaker statistics', async () => {
      const response = await request(app.getHttpServer()).get('/circuit-breaker/stats').expect(200);

      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('stats');
      expect(response.body.stats).toHaveProperty('users-service');
    });

    it('should provide service-specific circuit breaker stats', async () => {
      const response = await request(app.getHttpServer())
        .get('/circuit-breaker/stats/users-service')
        .expect(200);

      expect(response.body).toHaveProperty('service', 'users-service');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('stats');
    });
  });

  describe('Fallback Behavior', () => {
    it('should use fallback user validation when circuit is open', async () => {
      // Force circuit to open state
      const breaker = circuitBreakerService.getBreaker('users-service');
      breaker.open();

      const validation = await usersServiceClient.getUser('user-123');

      // Should return fallback user
      expect(validation).toHaveProperty('id', 'user-123');
      expect(validation).toHaveProperty('name', 'Unknown User');
      expect(validation).toHaveProperty('balance', 0);
    });

    it('should use fallback balance when circuit is open', async () => {
      // Force circuit to open state
      const breaker = circuitBreakerService.getBreaker('users-service');
      breaker.open();

      const balance = await usersServiceClient.getUserBalance('user-123');

      // Should return zero balance fallback
      expect(balance).toHaveProperty('balance', 0);
    });
  });
});
