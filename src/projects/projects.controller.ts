import { Controller, Post, Body, UseGuards, Request, Get, Query, Put, Param } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Проекти та Контракти')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('public-stats')
  @ApiOperation({ summary: 'Отримати публічну статистику проектів' })
  @ApiResponse({ status: 200, description: 'Публічна статистика успішно отримана.' })
  async getPublicStats() {
    return this.projectsService.getPublicStats();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Створення нового проекту (тільки для замовників)' })
  @ApiResponse({ status: 201, description: 'Проект успішно створено.' })
  async create(@Request() req: any, @Body() dto: CreateProjectDto) {
    return this.projectsService.createProject(req.user.userId, req.user.role, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  @ApiOperation({ summary: 'Отримати мої проекти' })
  @ApiResponse({ status: 200, description: 'Список моїх проектів успішно отримано.' })
  async getMyProjects(@Request() req: any) {
    console.log(req.user.userId, req.user.role);
    return this.projectsService.findMyProjects(req.user.userId, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Отримати всі проекти' })
  @ApiResponse({ status: 200, description: 'Список проектів успішно отримано.' })
  @ApiQuery({ name: 'search', required: false, description: 'Пошуковий запит' })
  @ApiQuery({ name: 'minBudget', required: false, description: 'Мінімальний бюджет' })
  @ApiQuery({ name: 'maxBudget', required: false, description: 'Максимальний бюджет' })
  @ApiQuery({ name: 'skills', required: false, description: 'Навички' })

  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query('search') search?: string,
    @Query('minBudget') minBudget?: string,
    @Query('maxBudget') maxBudget?: string,
    @Query('skills') skills?: string,
  ) {
    console.log({ search, minBudget, maxBudget, skills });
    return this.projectsService.findFiltered(search, minBudget, maxBudget, skills);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: { title: string; description: string; budget: number }
  ) {
    return this.projectsService.updateProject(Number(id), req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('accept-proposal/:proposalId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Прийняти пропозицію' })
  @ApiResponse({ status: 200, description: 'Пропозицію успішно прийнято' })
  async acceptProposal(@Param('proposalId') proposalId: string, @Request() req: any) {
    return this.projectsService.acceptProposal(Number(proposalId), req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/complete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Завершення контракту та виплата коштів фрілансеру' })
  @ApiResponse({ status: 200, description: 'Гроші перераховано, контракт закрито' })
  async completeContract(@Param('id') id: string, @Request() req: any) {
    return this.projectsService.completeContractAndPay(Number(id), req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/dispute')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Відкрити арбітраж' })
  @ApiResponse({ status: 200, description: 'Арбітраж успішно відкрито' })
  async disputeContract(@Param('id') id: string, @Body('reason') reason: string, @Request() req: any) {
    return this.projectsService.openDispute(Number(id), req.user.userId, reason);
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('contract/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Отримати деталі контракту' })
  @ApiResponse({ status: 200, description: 'Деталі контракту успішно отримано' })
  async getContract(@Param('id') id: string, @Request() req: any): Promise<any> {
    return this.projectsService.getContractDetails(Number(id), req.user.userId);
  }

}