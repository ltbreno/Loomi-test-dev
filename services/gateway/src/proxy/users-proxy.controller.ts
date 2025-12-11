import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Multer file type
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersProxyController {
  private readonly usersServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.usersServiceUrl = this.configService.get('USERS_SERVICE_URL') || 'http://localhost:3001';
  }

  @Get(':userId')
  @ApiOperation({
    summary: 'Buscar detalhes do usuário',
    description: 'Proxy para o serviço de usuários - retorna informações completas do usuário.',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID único do usuário (UUID)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
        name: { type: 'string', example: 'João Silva' },
        email: { type: 'string', example: 'joao.silva@example.com' },
        address: { type: 'string', example: 'Rua das Flores, 123, São Paulo - SP' },
        profilePicture: {
          type: 'string',
          example: 'https://s3.amazonaws.com/bucket/profile-pictures/user-123.jpg',
        },
        bankingDetails: {
          type: 'object',
          properties: {
            agency: { type: 'string', example: '0001' },
            accountNumber: { type: 'string', example: '12345678' },
            accountType: { type: 'string', enum: ['CHECKING', 'SAVINGS'], example: 'CHECKING' },
          },
        },
        balance: { type: 'number', example: 1250.75 },
        isActive: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-20T14:45:00.000Z' },
      },
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
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Token de autenticação inválido' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  async getUser(@Param('userId', ParseUUIDPipe) userId: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.usersServiceUrl}/api/users/${userId}`),
    );
    return response.data;
  }

  @Patch(':userId')
  @ApiOperation({
    summary: 'Atualizar dados do usuário',
    description: 'Proxy para o serviço de usuários - atualiza informações do perfil do usuário.',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID único do usuário (UUID)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiBody({
    description: 'Campos a serem atualizados (todos opcionais)',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'João Silva', description: 'Nome completo do usuário' },
        email: {
          type: 'string',
          example: 'joao.silva@example.com',
          description: 'Email do usuário',
        },
        address: {
          type: 'string',
          example: 'Rua das Flores, 123, São Paulo - SP',
          description: 'Endereço do usuário',
        },
        bankingDetails: {
          type: 'object',
          description: 'Dados bancários do usuário',
          properties: {
            agency: { type: 'string', example: '0001' },
            accountNumber: { type: 'string', example: '12345678' },
            accountType: { type: 'string', enum: ['CHECKING', 'SAVINGS'], example: 'CHECKING' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  async updateUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateData: Record<string, unknown>,
  ) {
    const response = await firstValueFrom(
      this.httpService.patch(`${this.usersServiceUrl}/api/users/${userId}`, updateData),
    );
    return response.data;
  }

  @Patch(':userId/profile-picture')
  @ApiOperation({
    summary: 'Atualizar foto de perfil',
    description:
      'Proxy para o serviço de usuários - faz upload e atualiza a foto de perfil do usuário.',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID único do usuário (UUID)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Arquivo de imagem para foto de perfil',
    schema: {
      type: 'object',
      properties: {
        profilePicture: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de imagem (JPEG, PNG) - máximo 5MB',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Foto de perfil atualizada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Arquivo inválido',
  })
  @ApiResponse({
    status: 413,
    description: 'Arquivo muito grande',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  @UseInterceptors(FileInterceptor('profilePicture'))
  async updateProfilePicture(
    @Param('userId', ParseUUIDPipe) userId: string,
    @UploadedFile() file: MulterFile,
  ) {
    const formData = new FormData();
    formData.append('profilePicture', new Blob([Buffer.from(file.buffer)]), file.originalname);

    const response = await firstValueFrom(
      this.httpService.patch(
        `${this.usersServiceUrl}/api/users/${userId}/profile-picture`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      ),
    );
    return response.data;
  }

  @Get(':userId/balance')
  @ApiOperation({
    summary: 'Consultar saldo do usuário',
    description: 'Proxy para o serviço de usuários - retorna o saldo atual da conta bancária.',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID único do usuário (UUID)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiResponse({
    status: 200,
    description: 'Saldo consultado com sucesso',
    schema: {
      type: 'object',
      properties: {
        balance: {
          type: 'number',
          format: 'decimal',
          example: 1250.75,
          description: 'Saldo atual da conta em reais',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  async getBalance(@Param('userId', ParseUUIDPipe) userId: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.usersServiceUrl}/api/users/${userId}/balance`),
    );
    return response.data;
  }
}
