import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateTransactionRequest,
  PaginatedResponse,
  TransactionRecord,
} from '@loomi/shared';

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionsProxyController {
  private readonly transactionsServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.transactionsServiceUrl =
      this.configService.get('TRANSACTIONS_SERVICE_URL') || 'http://localhost:3002';
  }

  @Post()
  @ApiOperation({
    summary: 'Criar nova transação',
    description:
      'Proxy para o serviço de transações - inicia uma nova transferência entre usuários.',
  })
  @ApiBody({
    description: 'Dados da transação a ser criada',
    schema: {
      type: 'object',
      required: ['senderUserId', 'receiverUserId', 'amount', 'description'],
      properties: {
        senderUserId: {
          type: 'string',
          format: 'uuid',
          example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          description: 'ID do usuário que envia a transação',
        },
        receiverUserId: {
          type: 'string',
          format: 'uuid',
          example: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
          description: 'ID do usuário que recebe a transação',
        },
        amount: {
          type: 'number',
          format: 'decimal',
          minimum: 0.01,
          example: 100.5,
          description: 'Valor da transação em reais',
        },
        description: {
          type: 'string',
          maxLength: 500,
          example: 'Pagamento por serviços de consultoria',
          description: 'Descrição da transação',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Transação criada com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou saldo insuficiente',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Usuário não pode transferir para si mesmo',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  async createTransaction(
    @Body() createTransactionDto: CreateTransactionRequest,
  ): Promise<TransactionRecord> {
    const response = await firstValueFrom(
      this.httpService.post<TransactionRecord>(
        `${this.transactionsServiceUrl}/api/transactions`,
        createTransactionDto,
      ),
    );
    return response.data;
  }

  @Get(':transactionId')
  @ApiOperation({
    summary: 'Buscar detalhes da transação',
    description:
      'Proxy para o serviço de transações - retorna informações completas de uma transação.',
  })
  @ApiParam({
    name: 'transactionId',
    description: 'ID único da transação (UUID)',
    example: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  })
  @ApiResponse({
    status: 200,
    description: 'Transação encontrada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Transação não encontrada',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  async getTransaction(
    @Param('transactionId', ParseUUIDPipe) transactionId: string,
  ): Promise<TransactionRecord> {
    const response = await firstValueFrom(
      this.httpService.get<TransactionRecord>(
        `${this.transactionsServiceUrl}/api/transactions/${transactionId}`,
      ),
    );
    return response.data;
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Buscar histórico de transações do usuário',
    description:
      'Proxy para o serviço de transações - retorna o histórico paginado de transações do usuário.',
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
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Parâmetros de paginação inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  async getUserTransactions(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedResponse<TransactionRecord>> {
    const response = await firstValueFrom(
      this.httpService.get<PaginatedResponse<TransactionRecord>>(
        `${this.transactionsServiceUrl}/api/transactions/user/${userId}?page=${page}&limit=${limit}`,
      ),
    );
    return response.data;
  }

  @Post(':transactionId/reverse')
  @ApiOperation({
    summary: 'Reverter transação',
    description:
      'Proxy para o serviço de transações - inicia o processo de reversão de uma transação.',
  })
  @ApiParam({
    name: 'transactionId',
    description: 'ID único da transação a ser revertida (UUID)',
    example: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  })
  @ApiResponse({
    status: 201,
    description: 'Transação revertida com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Transação não pode ser revertida',
  })
  @ApiResponse({
    status: 404,
    description: 'Transação não encontrada',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não autorizado a reverter esta transação',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  async reverseTransaction(
    @Param('transactionId', ParseUUIDPipe) transactionId: string,
  ): Promise<TransactionRecord> {
    const response = await firstValueFrom(
      this.httpService.post<TransactionRecord>(
        `${this.transactionsServiceUrl}/api/transactions/${transactionId}/reverse`,
      ),
    );
    return response.data;
  }
}
