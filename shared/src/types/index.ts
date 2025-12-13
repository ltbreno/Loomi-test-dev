import { ApiProperty } from '@nestjs/swagger';
import { AccountType, TransactionStatus, TransactionType } from '../enums';

export interface BankingDetails {
  agency: string;
  accountNumber: string;
  accountType: AccountType;
}

export interface UserBalance {
  userId: string;
  balance: number;
  updatedAt: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

// Classe genérica para documentação Swagger de respostas paginadas
export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Array de itens da página atual',
    isArray: true,
  })
  data: T[];

  @ApiProperty({
    description: 'Total de itens encontrados',
    example: 150,
    type: 'number',
  })
  total: number;

  @ApiProperty({
    description: 'Página atual',
    example: 1,
    type: 'number',
  })
  page: number;

  @ApiProperty({
    description: 'Número de itens por página',
    example: 10,
    type: 'number',
  })
  limit: number;

  @ApiProperty({
    description: 'Total de páginas disponíveis',
    example: 15,
    type: 'number',
  })
  totalPages: number;
}

// Mantém a interface original para uso interno
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  address?: string;
  bankingDetails?: BankingDetails;
  profilePicture?: string | null;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  address?: string | null;
  profilePicture?: string | null;
  bankingDetails?: BankingDetails | null;
  balance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransactionRequest {
  senderUserId: string;
  receiverUserId: string;
  amount: number;
  description: string;
}

export type TransactionMetadata = Record<string, unknown>;

export interface TransactionRecord {
  id: string;
  senderUserId: string;
  receiverUserId: string;
  amount: number;
  description: string;
  status: TransactionStatus;
  type: TransactionType;
  metadata?: TransactionMetadata | null;
  createdAt: Date;
  processedAt: Date;
}

