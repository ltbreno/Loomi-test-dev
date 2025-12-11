import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Token de acesso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Token de refresh JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Tipo do token',
    example: 'Bearer',
  })
  tokenType: string;

  @ApiProperty({
    description: 'Tempo de expiração do token de acesso em segundos',
    example: 3600,
  })
  expiresIn: number;
}

export class RegisterResponseDto {
  @ApiProperty({
    description: 'Mensagem de sucesso',
    example: 'Usuário criado com sucesso',
  })
  message: string;

  @ApiProperty({
    description: 'ID do usuário criado',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  userId: string;
}
