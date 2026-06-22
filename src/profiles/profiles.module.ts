import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { Users } from '../entities/Users';
import { Freelancerprofiles } from '../entities/Freelancerprofiles';
import { Clientprofiles } from '../entities/Clientprofiles';
import { Userwallets } from '../entities/Userwallets';
import { Reviews } from '../entities/Reviews';

@Module({
  imports: [
    MikroOrmModule.forFeature([Users, Freelancerprofiles, Clientprofiles, Userwallets, Reviews])
  ],
  providers: [ProfilesService],
  controllers: [ProfilesController]
})
export class ProfilesModule {}