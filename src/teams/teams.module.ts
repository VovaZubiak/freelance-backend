import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { Team } from '../entities/Team';
import { TeamMember } from '../entities/TeamMember';
import { TeamMessage } from '../entities/TeamMessage';
import { Users } from '../entities/Users';

@Module({
  imports: [
    MikroOrmModule.forFeature([Team, TeamMember, TeamMessage, Users])
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
})
export class TeamsModule {}