import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { FreelancersController } from './freelancers.controller';
import { FreelancersService } from './freelancers.service';
import { Users } from '../entities/Users';
import { Freelancerprofiles } from '../entities/Freelancerprofiles';

@Module({
  imports: [MikroOrmModule.forFeature([Users, Freelancerprofiles])],
  controllers: [FreelancersController],
  providers: [FreelancersService]
})
export class FreelancersModule {}