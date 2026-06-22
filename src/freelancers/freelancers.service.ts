import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Freelancerprofiles } from '../entities/Freelancerprofiles';

@Injectable()
export class FreelancersService {
  constructor(private readonly em: EntityManager) {}

  async findFiltered(search?: string, minRate?: string, maxRate?: string, skills?: string) {
    const query: any = {};

    if (search) {
      query.$or = [
        { user: { fullName: { $ilike: `%${search}%` } } },
        { headline: { $ilike: `%${search}%` } },
        { bio: { $ilike: `%${search}%` } }
      ];
    }

    if (minRate || maxRate) {
      query.hourlyRate = {};
      if (minRate) query.hourlyRate.$gte = minRate;
      if (maxRate) query.hourlyRate.$lte = maxRate;
    }

    const profiles = await this.em.find(Freelancerprofiles, query, {
      populate: ['user'],
    });

    return profiles.map(profile => ({
      userId: profile.user.userId,
      fullName: profile.user.fullName,
      bio: profile.headline || profile.bio || 'Опис відсутній',
      hourlyRate: profile.hourlyRate ? parseFloat(profile.hourlyRate) : 0,
      rating: profile.totalRating ? parseFloat(profile.totalRating) : 0,
      skills: [],
      reviewsCount: 0
    }));
  }
}