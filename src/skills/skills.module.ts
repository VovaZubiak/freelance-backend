import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { Skills } from '../entities/Skills';

@Module({
  imports: [MikroOrmModule.forFeature([Skills])],
  controllers: [SkillsController],
  providers: [SkillsService]
})
export class SkillsModule {}