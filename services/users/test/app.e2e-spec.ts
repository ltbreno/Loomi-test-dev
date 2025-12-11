import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from './../src/app.module';

describe('Users Service (e2e)', () => {
  let app: INestApplication;
  let createdUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/users (POST)', () => {
    it('should create a new user', () => {
      return request(app.getHttpServer())
        .post('/api/users')
        .send({
          name: 'Test User',
          email: 'test-e2e@example.com',
          password: 'password123',
          address: 'Test Address',
          bankingDetails: {
            agency: '0001',
            accountNumber: '12345678',
            accountType: 'CHECKING',
          },
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.email).toBe('test-e2e@example.com');
          createdUserId = response.body.id;
        });
    });

    it('should return 409 if email already exists', () => {
      return request(app.getHttpServer())
        .post('/api/users')
        .send({
          name: 'Duplicate User',
          email: 'test-e2e@example.com',
          password: 'password123',
        })
        .expect(409);
    });
  });

  describe('/api/users/:id (GET)', () => {
    it('should return a user by id', () => {
      return request(app.getHttpServer())
        .get(`/api/users/${createdUserId}`)
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBe(createdUserId);
          expect(response.body).not.toHaveProperty('password');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/api/users/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer()).get('/health').expect(200);
    });
  });
});
