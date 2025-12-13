import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { UsersService } from '../users/users.service';

class ValidateUserDto {
  @IsEmail({}, { message: 'Email deve ser válido' })
  @IsNotEmpty({ message: 'Email não pode estar vazio' })
  email!: string;

  @IsString({ message: 'Password deve ser uma string' })
  @IsNotEmpty({ message: 'Password não pode estar vazio' })
  password!: string;
}

@ApiTags('auth')
@Controller('api/users')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Post('validate')
  @ApiOperation({ summary: 'Validate user credentials (internal use)' })
  @ApiResponse({ status: 200, description: 'User validated successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async validate(@Body() validateUserDto: ValidateUserDto) {
    const user = await this.usersService.validatePassword(
      validateUserDto.email,
      validateUserDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }
}
