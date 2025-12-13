import { ApiProperty } from '@nestjs/swagger';

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED',
}

export enum TransactionType {
  TRANSFER = 'TRANSFER',
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
}

export enum AccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
}

// Classes para documentação Swagger dos enums
export class TransactionStatusEnum {
  @ApiProperty({
    enum: TransactionStatus,
    example: TransactionStatus.PENDING,
    description: 'Status da transação',
  })
  status!: TransactionStatus;
}

export class TransactionTypeEnum {
  @ApiProperty({
    enum: TransactionType,
    example: TransactionType.TRANSFER,
    description: 'Tipo da transação',
  })
  type!: TransactionType;
}

export class AccountTypeEnum {
  @ApiProperty({
    enum: AccountType,
    example: AccountType.CHECKING,
    description: 'Tipo da conta bancária',
  })
  accountType!: AccountType;
}

export enum EventType {
  USER_BANKING_DETAILS_UPDATED = 'user.banking-details.updated',
  USER_BALANCE_UPDATED = 'user.balance.updated',
  TRANSACTION_COMPLETED = 'transaction.completed',
  TRANSACTION_FAILED = 'transaction.failed',
  NOTIFICATION_REQUESTED = 'notification.requested',
}
