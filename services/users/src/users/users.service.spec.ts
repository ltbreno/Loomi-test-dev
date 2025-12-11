import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CacheService } from '../cache/cache.service';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { S3Service } from './s3.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;
  let cacheService: CacheService;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
    balance: 1000,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: KafkaProducerService,
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: S3Service,
          useValue: {
            uploadFile: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
    cacheService = module.get<CacheService>(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user from cache if available', async () => {
      jest.spyOn(cacheService, 'get').mockResolvedValue(mockUser as any);

      const result = await service.findOne(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(cacheService.get).toHaveBeenCalledWith(`user:${mockUser.id}`);
      expect(repository.findOne).not.toHaveBeenCalled();
    });

    it('should return a user from database if not in cache', async () => {
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser as any);
      jest.spyOn(cacheService, 'set').mockResolvedValue();

      const result = await service.findOne(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: mockUser.id } });
      expect(cacheService.set).toHaveBeenCalledWith(`user:${mockUser.id}`, mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(mockUser as any);
      jest.spyOn(repository, 'save').mockResolvedValue(mockUser as any);
      jest.spyOn(cacheService, 'set').mockResolvedValue();

      const result = await service.create(createUserDto as any);

      expect(result).toBeDefined();
      expect(repository.save).toHaveBeenCalled();
      expect(cacheService.set).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      const createUserDto = {
        name: 'New User',
        email: 'test@example.com',
        password: 'password123',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser as any);

      await expect(service.create(createUserDto as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('getBalance', () => {
    it('should return user balance', async () => {
      jest.spyOn(cacheService, 'get').mockResolvedValue(mockUser as any);

      const result = await service.getBalance(mockUser.id);

      expect(result).toEqual({ balance: 1000 });
    });
  });
});
