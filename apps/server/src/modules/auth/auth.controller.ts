import { Controller, Post, Body } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('register')
  async register(@Body() dto: { email: string; password: string; username: string }) {
    // TODO: Implement registration logic with Prisma
    return {
      message: 'Registration endpoint - to be implemented',
      data: dto,
    };
  }

  @Post('login')
  async login(@Body() _dto: { email: string; password: string }) {
    // TODO: Implement login logic
    return {
      message: 'Login endpoint - to be implemented',
      accessToken: 'mock-token',
    };
  }
}
