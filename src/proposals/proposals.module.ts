import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ProposalsService } from './proposals.service';
import { ProposalsController } from './proposals.controller';
import { Proposals } from '../entities/Proposals';
import { Projects } from '../entities/Projects';
import { Users } from '../entities/Users';

@Module({
  imports: [MikroOrmModule.forFeature([Proposals, Projects, Users])],
  controllers: [ProposalsController],
  providers: [ProposalsService],
})
export class ProposalsModule {}