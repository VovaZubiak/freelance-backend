import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { CreateReviewDto } from './dto/create-review.dto';
import { Reviews } from '../entities/Reviews';
import { Contracts } from '../entities/Contracts';
import { Freelancerprofiles } from '../entities/Freelancerprofiles';
import { RatingCalculator, FreelancerStats } from './rating.calculator';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly em: EntityManager,
    private readonly ratingCalculator: RatingCalculator,
  ) {}

  async leaveReview(userId: number, role: string, dto: CreateReviewDto) {
    const contract = await this.em.findOne(Contracts, { contractId: dto.contractId }, {
      populate: ['client', 'freelancer'] 
    });

    if (!contract) throw new NotFoundException('Контракт не знайдено');
    
    let reviewer: any;
    let reviewee: any;
    let isReviewingFreelancer = false;

    if (contract.client.userId === userId) {
      reviewer = contract.client;
      reviewee = contract.freelancer;
      isReviewingFreelancer = true;
    } else if (contract.freelancer.userId === userId) {
      reviewer = contract.freelancer;
      reviewee = contract.client;
    } else {
      throw new ForbiddenException('Ви не є учасником цього контракту');
    }

    const existingReview = await this.em.findOne(Reviews, {
      contract: contract.contractId,
      reviewer: reviewer.userId
    });

    if (existingReview) {
      throw new BadRequestException('Ви вже залишили відгук для цього контракту');
    }

    const review = this.em.create(Reviews, {
      contract: contract,
      reviewer: reviewer,
      reviewee: reviewee,
      rating: dto.stars,
      comment: dto.comment,
    });

    contract.status = 'completed';

    await this.em.persistAndFlush([review, contract]); 

    if (isReviewingFreelancer) {
      await this.updateFreelancerRating(contract.freelancer.userId);
    }

    return review;
  }

  private async updateFreelancerRating(freelancerId: number) {
    const allReviews = await this.em.find(Reviews, { reviewee: { userId: freelancerId } });
    const allContracts = await this.em.find(Contracts, { freelancer: { userId: freelancerId } });
    
    const completedProjects = allContracts.filter(c => c.status === 'completed').length;
    const totalStarted = allContracts.length;

    const stats: FreelancerStats = {
      reviews: allReviews.map(r => ({
        stars: r.rating,
        createdAt: r.createdAt || new Date(),
      })),
      completedProjects,
      totalStarted,
      lastActive: new Date(),
    };

    const newRating = this.ratingCalculator.calculate(stats);

    const profile = await this.em.findOne(Freelancerprofiles, { user: { userId: freelancerId } });
    if (profile) {
      profile.totalRating = String(newRating);
      await this.em.flush();
    }
  }
}