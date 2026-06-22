import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Users } from 'src/entities/Users';
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @ApiOperation({ summary: 'Створити нову команду' })
  createTeam(@Request() req: any, @Body() body: { name: string; description?: string }) {
    return this.teamsService.createTeam(req.user.userId, body.name, body.description);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Отримати інформацію про команду' })
  getTeamInfo(@Param('id') id: string) {
    return this.teamsService.getTeamInfo(Number(id));
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Додати учасника до команди' })
  addMember(@Request() req: any, @Param('id') teamId: string, @Body() body: { targetUserId: number }) {
    return this.teamsService.addMember(req.user.userId, Number(teamId), body.targetUserId);
  }

  @Delete(':id/members/:targetId')
  @ApiOperation({ summary: 'Видалити учасника з команди' })
  removeMember(@Request() req: any, @Param('id') teamId: string, @Param('targetId') targetId: string) {
    return this.teamsService.removeMember(req.user.userId, Number(teamId), Number(targetId));
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Відправити повідомлення в команду' })
  sendMessage(@Request() req: any, @Param('id') teamId: string, @Body() body: { content: string }) {
    return this.teamsService.sendMessage(req.user.userId, Number(teamId), body.content);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Отримати повідомлення з команди' })
  getMessages(@Request() req: any, @Param('id') teamId: string) {
    return this.teamsService.getMessages(req.user.userId, Number(teamId));
  }

 @Get('search/freelancers/:query')
 @ApiOperation({ summary: 'Пошук фрилансерів для інвайту в команду' })
  async searchFreelancers(@Param('query') query: string) {
    return this.teamsService.searchFreelancers(query);
  }
}