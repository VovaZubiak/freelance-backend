import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ProposalsService } from './proposals.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Заявки до проектів')
@Controller('proposals')
@UseGuards(JwtAuthGuard)
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Post()
  @ApiOperation({ summary: 'Подача заявки на проект (тільки для фрілансерів)' })
  async create(@Request() req: any, @Body() dto: CreateProposalDto) {
    return this.proposalsService.createProposal(req.user.userId, req.user.role, dto);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Отримання списку заявок на проект' })
  async getByProject(@Request() req: any, @Param('projectId') projectId: string) {
    return this.proposalsService.getProjectProposals(Number(projectId), req.user.userId, req.user.role);
  }

  @Delete('project/:projectId')
  @ApiOperation({ summary: 'Скасування заявки на проект' })
  async cancel(@Request() req: any, @Param('projectId') projectId: string) {
    return this.proposalsService.cancelProposal(req.user.userId, req.user.role, Number(projectId));
  }
}