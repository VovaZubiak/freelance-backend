import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Projects } from '../entities/Projects';
import { Users } from '../entities/Users';
import { Skills } from '../entities/Skills';
import { Contracts } from '../entities/Contracts';
import { Userwallets } from 'src/entities/Userwallets';
import { Proposals } from 'src/entities/Proposals';
import { Disputes } from 'src/entities/Disputes';
import { Transactions } from 'src/entities/Transactions';

@Module({
  imports: [MikroOrmModule.forFeature([Projects, Users, Skills, Contracts, Userwallets, Proposals, Disputes, Transactions])], 
  controllers: [ProjectsController],
  providers: [ProjectsService]
})
export class ProjectsModule {}