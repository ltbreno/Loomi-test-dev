import { Controller, Get, Patch, Post, Body, UseGuards, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LimitsService } from './limits.service';
import { UpdateLimitDto } from './dto/update-limit.dto';
import { LimitIncreaseRequestDto } from './dto/limit-increase-request.dto';
import { LimitsUsageDto, LimitIncreaseRequestResponseDto } from './dto/limits-usage.dto';
import { UserLimits } from './entities/user-limits.entity';
import { LimitIncreaseRequest } from './entities/limit-increase-request.entity';

@ApiTags('limits')
@Controller('limits')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class LimitsController {
  constructor(private readonly limitsService: LimitsService) {}

  @Get()
  @ApiOperation({
    summary: 'Obter limites atuais do usuário',
    description: 'Retorna todos os limites configurados para o usuário autenticado'
  })
  @ApiResponse({
    status: 200,
    description: 'Limites retornados com sucesso',
    type: UserLimits
  })
  async getLimits(@Req() req): Promise<UserLimits> {
    return this.limitsService.getUserLimits(req.user.userId);
  }

  @Get('usage')
  @ApiOperation({
    summary: 'Uso atual vs limites',
    description: 'Retorna estatísticas de uso atual dos limites diário e mensal'
  })
  @ApiResponse({
    status: 200,
    description: 'Uso dos limites calculado com sucesso',
    type: LimitsUsageDto
  })
  async getLimitsUsage(@Req() req): Promise<LimitsUsageDto> {
    return this.limitsService.getLimitsUsage(req.user.userId);
  }

  @Patch('daily')
  @ApiOperation({
    summary: 'Atualizar limite diário',
    description: 'Permite ao usuário ajustar seu limite diário de gastos'
  })
  @ApiResponse({
    status: 200,
    description: 'Limite diário atualizado com sucesso',
    type: UserLimits
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou limite fora dos parâmetros permitidos'
  })
  async updateDailyLimit(
    @Body() dto: UpdateLimitDto,
    @Req() req
  ): Promise<UserLimits> {
    return this.limitsService.updateDailyLimit(req.user.userId, dto.limit);
  }

  @Patch('monthly')
  @ApiOperation({
    summary: 'Atualizar limite mensal',
    description: 'Permite ao usuário aumentar seu limite mensal (reduções requerem solicitação específica)'
  })
  @ApiResponse({
    status: 200,
    description: 'Limite mensal atualizado com sucesso',
    type: UserLimits
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou limite fora dos parâmetros permitidos'
  })
  async updateMonthlyLimit(
    @Body() dto: UpdateLimitDto,
    @Req() req
  ): Promise<UserLimits> {
    return this.limitsService.updateMonthlyLimit(req.user.userId, dto.limit);
  }

  @Post('increase-request')
  @ApiOperation({
    summary: 'Solicitar aumento de limite',
    description: 'Cria uma solicitação formal para aumento de limite, sujeita a aprovação'
  })
  @ApiResponse({
    status: 201,
    description: 'Solicitação criada com sucesso',
    type: LimitIncreaseRequestResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Já existe solicitação pendente ou dados inválidos'
  })
  async requestLimitIncrease(
    @Body() dto: LimitIncreaseRequestDto,
    @Req() req
  ): Promise<{ requestId: string; status: string; message: string; expiresAt: Date | undefined }> {
    return this.limitsService.requestLimitIncrease(req.user.userId, dto);
  }

  @Get('increase-requests')
  @ApiOperation({
    summary: 'Histórico de solicitações de aumento',
    description: 'Retorna todas as solicitações de aumento de limite do usuário'
  })
  @ApiResponse({
    status: 200,
    description: 'Histórico retornado com sucesso',
    type: [LimitIncreaseRequest]
  })
  async getLimitIncreaseRequests(@Req() req): Promise<LimitIncreaseRequest[]> {
    return this.limitsService.getLimitIncreaseRequests(req.user.userId);
  }
}