import { Controller, Get, Query } from '@nestjs/common';
import { FreelancersService } from './freelancers.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@Controller('freelancers')
export class FreelancersController {
  constructor(private readonly freelancersService: FreelancersService) {}

  @Get()
  @ApiOperation({ summary: 'Отримання списку фрілансерів з фільтрами' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'skills', required: false, description: 'ID навичок через кому' })
  @ApiQuery({ name: 'minRate', required: false, description: 'Мінімальна годинна ставка' })
  @ApiQuery({ name: 'maxRate', required: false, description: 'Максимальна годинна ставка' })
  async findAll(
    @Query('search') search?: string,
    @Query('minRate') minRate?: string,
    @Query('maxRate') maxRate?: string,
    @Query('skills') skills?: string,
  ) {
    console.log('--- Фільтри пошуку фрілансерів ---', { search, minRate, maxRate, skills });
    return this.freelancersService.findFiltered(search, minRate, maxRate, skills);
  }
}