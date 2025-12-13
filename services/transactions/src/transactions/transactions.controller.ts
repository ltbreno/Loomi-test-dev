import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { PaginatedResponse } from '@loomi/shared';

@ApiTags('transactions')
@ApiBearerAuth('JWT-auth')
@Controller('api/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar nova transação',
    description:
      'Inicia uma nova transação financeira entre dois usuários. A transação é processada de forma assíncrona via Kafka.',
  })
  @ApiBody({
    type: CreateTransactionDto,
    description: 'Dados da transação a ser criada',
  })
  @ApiResponse({
    status: 201,
    description: 'Transação criada e em processamento',
    type: Transaction,
  })
  @ApiResponse({
    status: 400,
    description: 'Saldo insuficiente, valor inválido ou dados incorretos',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Saldo insuficiente para realizar a transação' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário remetente ou destinatário não encontrado',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Usuário não encontrado' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Usuário não pode transferir para si mesmo',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'Não é possível transferir para si mesmo' },
        error: { type: 'string', example: 'Conflict' },
      },
    },
  })
  async create(@Body() createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get(':transactionId')
  @ApiOperation({
    summary: 'Buscar detalhes da transação',
    description: 'Retorna todas as informações de uma transação específica.',
  })
  @ApiParam({
    name: 'transactionId',
    description: 'ID único da transação (UUID)',
    example: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  })
  @ApiResponse({
    status: 200,
    description: 'Transação encontrada com sucesso',
    type: Transaction,
  })
  @ApiResponse({
    status: 404,
    description: 'Transação não encontrada',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Transação não encontrada' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'ID da transação inválido',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Validation failed (uuid is expected)' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async findOne(
    @Param('transactionId', ParseUUIDPipe) transactionId: string,
  ): Promise<Transaction> {
    return this.transactionsService.findOne(transactionId);
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Buscar histórico de transações do usuário',
    description:
      'Retorna o histórico paginado de transações do usuário (como remetente ou destinatário).',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID único do usuário (UUID)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página (começando em 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Quantidade de itens por página (máximo 100)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Histórico de transações retornado com sucesso',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/PaginatedResponseDto' },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Transaction' },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Usuário não encontrado' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Parâmetros inválidos',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Parâmetros de paginação inválidos' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async findByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedResponse<Transaction>> {
    return this.transactionsService.findByUserId(userId, page, limit);
  }

  @Post(':transactionId/reverse')
  @ApiOperation({
    summary: 'Reverter transação',
    description:
      'Inicia o processo de reversão de uma transação. Apenas transações concluídas podem ser revertidas.',
  })
  @ApiParam({
    name: 'transactionId',
    description: 'ID único da transação a ser revertida (UUID)',
    example: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  })
  @ApiResponse({
    status: 201,
    description: 'Transação revertida com sucesso',
    type: Transaction,
  })
  @ApiResponse({
    status: 400,
    description: 'Transação não pode ser revertida (status inválido ou já revertida)',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Apenas transações concluídas podem ser revertidas' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Transação não encontrada',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Transação não encontrada' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não autorizado a reverter esta transação',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Apenas o destinatário pode reverter a transação' },
        error: { type: 'string', example: 'Forbidden' },
      },
    },
  })
  async reverse(
    @Param('transactionId', ParseUUIDPipe) transactionId: string,
  ): Promise<Transaction> {
    return this.transactionsService.reverse(transactionId);
  }
}
