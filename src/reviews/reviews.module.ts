import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { RatingCalculator } from './rating.calculator';
import { Reviews } from '../entities/Reviews'; 
import { Contracts } from '../entities/Contracts';
import { Freelancerprofiles } from '../entities/Freelancerprofiles';

@Module({
  imports: [MikroOrmModule.forFeature([Reviews, Contracts, Freelancerprofiles])],
  controllers: [ReviewsController],
  providers: [ReviewsService, RatingCalculator],
})
export class ReviewsModule {}