import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { UsersServiceClient } from './clients/users-service.client';
import { CircuitBreakerService } from '../circuit-breaker/circuit-breaker.service';
import { FallbackService } from '../circuit-breaker/fallback.service';
import { v4 as uuidv4 } from 'uuid';
import {
  TransactionStatus,
  TransactionCompletedEvent,
  TransactionFailedEvent,
  PaginatedResponse,
} from '@loomi/shared';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly dataSource: DataSource,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly usersServiceClient: UsersServiceClient,
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly fallbackService: FallbackService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const { senderUserId, receiverUserId, amount, description } = createTransactionDto;

    const [senderValidation, receiverValidation] = await Promise.all([
      this.validateUserWithCircuitBreaker(senderUserId),
      this.validateUserWithCircuitBreaker(receiverUserId),
    ]);

    if (!senderValidation.isValid || !receiverValidation.isValid) {
      throw new BadRequestException(
        'User validation unavailable. Transaction rejected for security.',
      );
    }

    if (senderValidation.balance !== undefined && senderValidation.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    if (senderUserId === receiverUserId) {
      throw new BadRequestException('Cannot transfer to yourself');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transaction = this.transactionRepository.create({
        senderUserId,
        receiverUserId,
        amount,
        description,
        status: TransactionStatus.PENDING,
      });

      const savedTransaction = await queryRunner.manager.save(transaction);

      await Promise.all([
        this.usersServiceClient.updateBalance(
          senderUserId,
          -amount,
          `Transfer to ${receiverUserId}`,
        ),
        this.usersServiceClient.updateBalance(
          receiverUserId,
          amount,
          `Transfer from ${senderUserId}`,
        ),
      ]);

      savedTransaction.status = TransactionStatus.COMPLETED;
      await queryRunner.manager.save(savedTransaction);

      await queryRunner.commitTransaction();

      const event: TransactionCompletedEvent = {
        eventId: uuidv4(),
        eventType: 'transaction.completed',
        timestamp: new Date(),
        version: '1.0',
        payload: {
          transactionId: savedTransaction.id,
          senderUserId,
          receiverUserId,
          amount,
          description,
        },
      };

      await this.kafkaProducer.send('transaction-events', {
        key: savedTransaction.id,
        value: JSON.stringify(event),
      });

      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      const failedTransaction = await this.transactionRepository.save({
        senderUserId,
        receiverUserId,
        amount,
        description,
        status: TransactionStatus.FAILED,
        metadata: { error: error.message },
      });

      const event: TransactionFailedEvent = {
        eventId: uuidv4(),
        eventType: 'transaction.failed',
        timestamp: new Date(),
        version: '1.0',
        payload: {
          transactionId: failedTransaction.id,
          senderUserId,
          receiverUserId,
          amount,
          reason: error.message,
        },
      };

      await this.kafkaProducer.send('transaction-events', {
        key: failedTransaction.id,
        value: JSON.stringify(event),
      });

      throw new HttpException(
        `Transaction failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({ where: { id } });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<Transaction>> {
    const skip = (page - 1) * limit;

    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: [{ senderUserId: userId }, { receiverUserId: userId }],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async reverse(id: string): Promise<Transaction> {
    const transaction = await this.findOne(id);

    if (transaction.status !== TransactionStatus.COMPLETED) {
      throw new BadRequestException('Only completed transactions can be reversed');
    }

    const reverseTransaction = await this.create({
      senderUserId: transaction.receiverUserId,
      receiverUserId: transaction.senderUserId,
      amount: Number(transaction.amount),
      description: `Reversal of transaction ${transaction.id}`,
    });

    transaction.status = TransactionStatus.REVERSED;
    await this.transactionRepository.save(transaction);

    return reverseTransaction;
  }

  private async validateUserWithCircuitBreaker(
    userId: string,
  ): Promise<{ isValid: boolean; balance?: number }> {
    try {
      const balance = await this.usersServiceClient.getUserBalance(userId);

      return {
        isValid: true,
        balance: balance.balance,
      };
    } catch (error) {
      if (error.message?.includes('Circuit Breaker')) {
        return this.fallbackService.validateUserFallback(userId);
      }
      throw error;
    }
  }
}
