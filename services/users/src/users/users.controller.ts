import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfilePictureDto } from './dto/update-profile-picture.dto';
import { User } from './entities/user.entity';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('api/users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar novo usuário',
    description:
      'Cria uma nova conta de usuário no sistema bancário com dados pessoais e bancários.',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'Dados para criação do usuário',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    type: User,
  })
  @ApiResponse({
    status: 409,
    description: 'Email já cadastrado no sistema',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'Email já cadastrado' },
        error: { type: 'string', example: 'Conflict' },
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
          example: ['name deve ser uma string', 'email deve ser um email válido'],
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get(':userId')
  @ApiOperation({
    summary: 'Buscar detalhes do usuário',
    description: 'Retorna todas as informações de um usuário específico, exceto senha.',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID único do usuário (UUID)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado com sucesso',
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
    description: 'ID do usuário inválido',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Validation failed (uuid is expected)' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async findOne(@Param('userId', ParseUUIDPipe) userId: string): Promise<User> {
    return this.usersService.findOne(userId);
  }

  @Patch(':userId')
  @ApiOperation({
    summary: 'Atualizar dados do usuário',
    description:
      'Atualiza parcialmente as informações do usuário. Apenas campos fornecidos serão atualizados.',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID único do usuário (UUID)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'Campos a serem atualizados (todos opcionais)',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado com sucesso',
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
    description: 'Dados inválidos ou ID do usuário inválido',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: ['email deve ser um email válido'],
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async update(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(userId, updateUserDto);
  }

  @Patch(':userId/profile-picture')
  @ApiOperation({
    summary: 'Atualizar foto de perfil',
    description: 'Faz upload e atualiza a foto de perfil do usuário. A imagem é armazenada no S3.',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID único do usuário (UUID)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdateProfilePictureDto,
    description: 'Arquivo de imagem para foto de perfil',
  })
  @ApiResponse({
    status: 200,
    description: 'Foto de perfil atualizada com sucesso',
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
    description: 'Arquivo inválido ou ID do usuário inválido',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Arquivo deve ser uma imagem válida (JPEG, PNG)' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 413,
    description: 'Arquivo muito grande',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 413 },
        message: { type: 'string', example: 'Arquivo deve ter no máximo 5MB' },
        error: { type: 'string', example: 'Payload Too Large' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('profilePicture'))
  async updateProfilePicture(
    @Param('userId', ParseUUIDPipe) userId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<User> {
    return this.usersService.updateProfilePicture(userId, file);
  }

  @Get(':userId/balance')
  @ApiOperation({
    summary: 'Consultar saldo do usuário',
    description:
      'Retorna o saldo atual da conta bancária do usuário. Dados em cache para performance.',
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
    description: 'ID do usuário inválido',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Validation failed (uuid is expected)' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async getBalance(@Param('userId', ParseUUIDPipe) userId: string): Promise<{ balance: number }> {
    return this.usersService.getBalance(userId);
  }
}
