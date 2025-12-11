import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto, RegisterResponseDto } from './dto/auth-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({
    summary: 'Autenticar usuário',
    description: `Realiza login do usuário com email e senha, retornando tokens de acesso e refresh.`,
  })
  @ApiBody({
    type: LoginDto,
    description: 'Credenciais de login do usuário',
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Credenciais inválidas' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Muitas tentativas de login - rate limit excedido',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 429 },
        message: { type: 'string', example: 'Muitas tentativas de login' },
        error: { type: 'string', example: 'Too Many Requests' },
      },
    },
  })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  @ApiOperation({
    summary: 'Registrar novo usuário',
    description: 'Cria uma nova conta de usuário no sistema bancário.',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'Dados para criação da conta do usuário',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Email já cadastrado',
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
    description: 'Dados inválidos',
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
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @ApiOperation({
    summary: 'Renovar token de acesso',
    description: 'Renova o token de acesso usando um token de refresh válido.',
  })
  @ApiBody({
    type: RefreshTokenDto,
    description: 'Token de refresh para renovação',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens renovados com sucesso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token de refresh inválido ou expirado',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Token de refresh inválido' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Token de refresh revogado',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Token de refresh revogado' },
        error: { type: 'string', example: 'Forbidden' },
      },
    },
  })
  async refresh(@Request() req) {
    return this.authService.refresh(req.user.refreshToken);
  }
}
