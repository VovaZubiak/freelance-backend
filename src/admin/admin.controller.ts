import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats(@Request() req: any) {
    return this.adminService.getDashboardStats(req.user.role);
  }

  @Get('users')
  getUsers(@Request() req: any) {
    return this.adminService.getAllUsers(req.user.role);
  }

  @Patch('users/:id/toggle-block')
  toggleUserStatus(@Request() req: any, @Param('id') id: string) {
    return this.adminService.toggleUserStatus(req.user.role, Number(id));
  }

  @Post('users/:id/message')
  sendMessage(@Request() req: any, @Param('id') id: string, @Body() body: { content: string }) {
    return this.adminService.sendMessageToUser(req.user.role, req.user.userId, Number(id), body.content);
  }

  @Get('disputes')
  getDisputes(@Request() req: any) {
    return this.adminService.getAllDisputes(req.user.role);
  }

  @Get('contracts/:id/messages')
  getContractChat(@Request() req: any, @Param('id') id: string) {
    return this.adminService.getContractChat(req.user.role, Number(id));
  }

  @Post('disputes/:id/resolve')
  resolveDispute(
    @Request() req: any, 
    @Param('id') id: string, 
    @Body() body: { winner: 'client' | 'freelancer', resolution: string }
  ) {
    return this.adminService.resolveDispute(req.user.role, Number(id), body.winner, body.resolution);
  }
}