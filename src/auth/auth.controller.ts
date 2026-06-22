import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Авторизація та Безпека')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Реєстрація нового користувача' })
  @ApiResponse({ status: 201, description: 'Користувача успішно створено.' })
  @ApiResponse({ status: 400, description: 'Некоректні дані реєстрації.' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Вхід користувача' })
  @ApiResponse({ status: 200, description: 'Вхід успішний.' })
  @ApiResponse({ status: 401, description: 'Невірні облікові дані.' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Відновлення пароля' })
  @ApiResponse({ status: 200, description: 'Інструкції для відновлення пароля надіслано.' })
  @ApiResponse({ status: 404, description: 'Користувача з таким email не знайдено.' })
  async forgotPassword(@Body('email') email: string) {
  return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Скидання пароля' })
  @ApiResponse({ status: 200, description: 'Пароль успішно скинуто.' })
  @ApiResponse({ status: 400, description: 'Некоректні дані скидання пароля.' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
  return this.authService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Отримання профілю поточного користувача' })
  @ApiResponse({ status: 200, description: 'Профіль успішно отримано.' })
  @ApiResponse({ status: 401, description: 'Токен відсутній або недійсний.' })
  getProfile(@Request() req: any) {
    return {
      message: 'Доступ дозволено!',
      user: req.user 
    };
  }
}