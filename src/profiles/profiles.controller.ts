import { Controller, Get, Put, Body, UseGuards, Request, Post, Param } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Профілі користувачів')
@ApiBearerAuth()
@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  @ApiOperation({ summary: 'Отримати інформацію про свій профіль' })
  @ApiResponse({ status: 200, description: 'Інформація про профіль успішно отримана.' })
  async getProfile(@Request() req: any) {
    return this.profilesService.getMyProfile(req.user.userId, req.user.role);
  }

  @Put('me')
  @ApiOperation({ summary: 'Оновити інформацію про свій профіль' })
  @ApiResponse({ status: 200, description: 'Інформація про профіль успішно оновлена.' })
  async updateProfile(@Request() req: any, @Body() updateData: any) {
    return this.profilesService.updateMyProfile(req.user.userId, req.user.role, updateData);
  }

  @Post('me/deposit')
  @UseGuards(JwtAuthGuard)
  async deposit(@Request() req: any, @Body() body: { amount: number }) {
    return this.profilesService.depositFunds(req.user.userId, Number(body.amount));
  }

  @Get(':id')
  async getProfileById(@Param('id') id: string) {
    return this.profilesService.getProfileById(Number(id));
  }
}