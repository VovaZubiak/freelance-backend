import { Controller, Get } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { ApiTags, ApiOperation} from '@nestjs/swagger';

@ApiTags('Довідник навичок')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  @ApiOperation({ summary: 'Отримання списку навичок' })
  async findAll() {
    return this.skillsService.findAll();
  }
}