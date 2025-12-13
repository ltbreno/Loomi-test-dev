import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CacheService } from '../cache/cache.service';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { S3Service } from './s3.service';
import {
  UserBankingDetailsUpdatedEvent,
  UserBalanceUpdatedEvent,
  BankingDetails,
} from '@loomi/shared';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cacheService: CacheService,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly s3Service: S3Service,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // Cache the user
    await this.cacheService.set(`user:${savedUser.id}`, savedUser);

    return savedUser;
  }

  async findOne(id: string): Promise<User> {
    // Try to get from cache first
    const cachedUser = await this.cacheService.get<User>(`user:${id}`);
    if (cachedUser) {
      return cachedUser;
    }

    // If not in cache, get from database
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Cache the user
    await this.cacheService.set(`user:${id}`, user);

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    const oldBankingDetails = user.bankingDetails;

    // Check if email is being changed and if it's already taken
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    // Update user
    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    // Invalidate cache
    await this.cacheService.del(`user:${id}`);

    // If banking details were updated, publish event
    if (
      updateUserDto.bankingDetails &&
      JSON.stringify(oldBankingDetails) !== JSON.stringify(user.bankingDetails)
    ) {
      const event: UserBankingDetailsUpdatedEvent = {
        eventId: uuidv4(),
        eventType: 'user.banking-details.updated',
        timestamp: new Date(),
        version: '1.0',
        payload: {
          userId: user.id,
          oldBankingDetails: oldBankingDetails as BankingDetails,
          newBankingDetails: user.bankingDetails || ({} as BankingDetails),
        },
      };

      await this.kafkaProducer.send('user-events', {
        key: user.id,
        value: JSON.stringify(event),
      });
    }

    return updatedUser;
  }

  async updateProfilePicture(id: string, file: Express.Multer.File): Promise<User> {
    const user = await this.findOne(id);

    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Upload to S3
    const fileUrl = await this.s3Service.uploadFile(file, `profile-pictures/${id}`);

    // Update user
    user.profilePicture = fileUrl;
    const updatedUser = await this.userRepository.save(user);

    // Invalidate cache
    await this.cacheService.del(`user:${id}`);

    return updatedUser;
  }

  async getBalance(id: string): Promise<{ balance: number }> {
    const user = await this.findOne(id);
    return { balance: Number(user.balance) };
  }

  async updateBalance(id: string, amount: number, reason: string): Promise<User> {
    const user = await this.findOne(id);
    const oldBalance = Number(user.balance);
    const newBalance = oldBalance + amount;

    if (newBalance < 0) {
      throw new BadRequestException('Insufficient balance');
    }

    user.balance = newBalance;
    const updatedUser = await this.userRepository.save(user);

    // Invalidate cache
    await this.cacheService.del(`user:${id}`);

    // Publish balance updated event
    const event: UserBalanceUpdatedEvent = {
      eventId: uuidv4(),
      eventType: 'user.balance.updated',
      timestamp: new Date(),
      version: '1.0',
      payload: {
        userId: user.id,
        oldBalance,
        newBalance,
        reason,
      },
    };

    await this.kafkaProducer.send('user-events', {
      key: user.id,
      value: JSON.stringify(event),
    });

    return updatedUser;
  }

  async validatePassword(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }
}
