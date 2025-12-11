import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Transaction } from './entities/transaction.entity';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { UsersServiceClient } from './clients/users-service.client';
import { TransactionStatus } from '@loomi/shared';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let repository: Repository<Transaction>;
  let usersClient: UsersServiceClient;

  const mockTransaction = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    senderUserId: 'user1',
    receiverUserId: 'user2',
    amount: 100,
    description: 'Test transfer',
    status: TransactionStatus.COMPLETED,
    createdAt: new Date(),
  };

  const mockUser = {
    id: 'user1',
    name: 'Test User',
    email: 'test@example.com',
    balance: 1000,
  };

  beforeEach(async () => {
    const mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        save: jest.fn().mockResolvedValue(mockTransaction),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
          },
        },
        {
          provide: KafkaProducerService,
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: UsersServiceClient,
          useValue: {
            getUser: jest.fn(),
            getUserBalance: jest.fn(),
            updateBalance: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    repository = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));
    usersClient = module.get<UsersServiceClient>(UsersServiceClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a transaction', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockTransaction as any);

      const result = await service.findOne(mockTransaction.id);

      expect(result).toEqual(mockTransaction);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: mockTransaction.id } });
    });

    it('should throw NotFoundException if transaction not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUserId', () => {
    it('should return paginated transactions', async () => {
      const transactions = [mockTransaction];
      jest.spyOn(repository, 'findAndCount').mockResolvedValue([transactions as any, 1]);

      const result = await service.findByUserId('user1', 1, 10);

      expect(result).toEqual({
        data: transactions,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });

  describe('create transaction validation', () => {
    it('should throw error if sender and receiver are the same', async () => {
      const createDto = {
        senderUserId: 'user1',
        receiverUserId: 'user1',
        amount: 100,
        description: 'Test',
      };

      jest.spyOn(usersClient, 'getUser').mockResolvedValue(mockUser);
      jest.spyOn(usersClient, 'getUserBalance').mockResolvedValue({ balance: 1000 });

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw error if insufficient balance', async () => {
      const createDto = {
        senderUserId: 'user1',
        receiverUserId: 'user2',
        amount: 2000,
        description: 'Test',
      };

      jest.spyOn(usersClient, 'getUser').mockResolvedValue(mockUser);
      jest.spyOn(usersClient, 'getUserBalance').mockResolvedValue({ balance: 1000 });

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });
});

