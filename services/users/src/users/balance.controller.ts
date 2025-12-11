import {
  Controller,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

class UpdateBalanceDto {
  @ApiProperty({
    description: 'Valor a ser adicionado ou subtraído do saldo',
    example: 100.5,
    type: 'number',
    format: 'decimal',
  })
  amount: number;

  @ApiProperty({
    description: 'Motivo da atualização do saldo',
    example: 'Depósito via PIX',
  })
  reason: string;
}

@ApiTags('balance')
@ApiBearerAuth('JWT-auth')
@Controller('api/users')
@UseInterceptors(ClassSerializerInterceptor)
export class BalanceController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(':userId/balance')
  @ApiOperation({
    summary: 'Atualizar saldo do usuário (uso interno)',
    description:
      'Endpoint interno para atualização do saldo da conta bancária do usuário. Usado principalmente pelos serviços de transação.',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID único do usuário (UUID)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiBody({
    type: UpdateBalanceDto,
    description: 'Dados para atualização do saldo',
  })
  @ApiResponse({
    status: 200,
    description: 'Saldo atualizado com sucesso',
    type: User,
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
    description: 'Dados inválidos fornecidos',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: ['amount deve ser um número'],
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  async updateBalance(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateBalanceDto: UpdateBalanceDto,
  ): Promise<User> {
    return this.usersService.updateBalance(
      userId,
      updateBalanceDto.amount,
      updateBalanceDto.reason,
    );
  }
}
