import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { Contracts } from '../entities/Contracts';
import { Projects } from '../entities/Projects';
import { Proposals } from '../entities/Proposals';

@Module({
  imports: [MikroOrmModule.forFeature([Contracts, Projects, Proposals])],
  controllers: [ContractsController],
  providers: [ContractsService],
})
export class ContractsModule {}