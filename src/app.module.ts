import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profiles/profiles.module';
import { ProjectsModule } from './projects/projects.module';
import { ProposalsModule } from './proposals/proposals.module';
import { ContractsModule } from './contracts/contracts.module';
import { MessagesModule } from './messages/messages.module';
import { ReviewsModule } from './reviews/reviews.module';
import mikroOrmConfig from '../mikro-orm.config'; 
import { SkillsModule } from './skills/skills.module';
import { FreelancersModule } from './freelancers/freelancers.module';
import { AdminModule } from './admin/admin.module';
import { TeamsModule } from './teams/teams.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MikroOrmModule.forRoot({
      ...mikroOrmConfig,
      autoLoadEntities: true,
    }),
    UsersModule,
    AuthModule,
    ProfilesModule,
    ProjectsModule,
    ProposalsModule,
    ContractsModule,
    MessagesModule,
    ReviewsModule,
    SkillsModule,
    FreelancersModule,
    AdminModule,
    TeamsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
