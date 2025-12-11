import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from '../users/users.service';

class ValidateUserDto {
  email: string;
  password: string;
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
      return null;
    }

    const { ...result } = user;
    return result;
  }
}
