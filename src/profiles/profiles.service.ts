import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Freelancerprofiles } from '../entities/Freelancerprofiles';
import { Clientprofiles } from '../entities/Clientprofiles';
import { Users } from '../entities/Users';
import { Userwallets } from '../entities/Userwallets';
import { Reviews } from '../entities/Reviews';
import { RatingSystem } from '../../wilson-score';

@Injectable()
export class ProfilesService {
  constructor(private readonly em: EntityManager) {}

  async getMyProfile(userId: number, role: string): Promise<any> {
    const user = await this.em.findOne(Users, { userId });
    if (!user) throw new NotFoundException('Користувача не знайдено');

    const wallet = await this.em.findOne(Userwallets, { user: { userId } });

    const rawReviews = await this.em.find(
      Reviews, 
      { reviewee: { userId } }, 
      { populate: ['reviewer'], orderBy: { createdAt: 'DESC' } }
    );

    const reviews = rawReviews.map(r => ({
      id: r.reviewId,
      author: r.reviewer.fullName,
      rating: Number(r.rating),
      text: r.comment,
      date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Невідома дата'
    }));

    let profileData: any = {};
    let calculatedRating = '0.0';

    if (role === 'freelancer') {
      const profile = await this.em.findOne(Freelancerprofiles, { user: { userId } });
      
      if (profile) {
        const stats = {
          reviews: rawReviews.map(r => ({ 
            stars: Number(r.rating), 
            createdAt: r.createdAt || new Date() 
          })),
          completedProjects: 10, 
          totalStarted: 15,      
          lastActive: new Date() 
        };

        const ratingSystem = new RatingSystem();
        const score100 = ratingSystem.calculate(stats); 
        
        calculatedRating = (score100 / 20).toFixed(1);

        profile.totalRating = calculatedRating;
        await this.em.flush();

        profileData = profile;
      }
    } else if (role === 'client') {
      const profile = await this.em.findOne(Clientprofiles, { user: { userId } });
      
      if (profile) {
        if (rawReviews.length > 0) {
          const sum = rawReviews.reduce((acc, r) => acc + Number(r.rating), 0);
          calculatedRating = (sum / rawReviews.length).toFixed(1);
        }
        profileData = profile;
      }
    } else {
      throw new BadRequestException('Невідома роль користувача');
    }

    return {
      userId: user.userId,
      email: user.email,
      fullName: user.fullName,
      role: role,
      balance: wallet ? wallet.balance : '0.00',
      currency: wallet ? wallet.currency : 'USD',
      reviews: reviews,
      ...profileData,
      totalRating: calculatedRating,
    };
  }

  async updateMyProfile(userId: number, role: string, updateData: any): Promise<any> {
    
    if (updateData.avatarUrl !== undefined) {
      const user = await this.em.findOne(Users, { userId });
      if (user) {
        user.avatarUrl = updateData.avatarUrl;
      }
    }

    if (role === 'freelancer') {
      const profile = await this.em.findOne(Freelancerprofiles, { user: { userId } });
      if (!profile) throw new NotFoundException('Профіль фрілансера не знайдено');
      
      if (updateData.headline !== undefined) profile.headline = updateData.headline;
      if (updateData.bio !== undefined) profile.bio = updateData.bio;
      if (updateData.hourlyRate !== undefined) profile.hourlyRate = String(updateData.hourlyRate);
      if (updateData.availability !== undefined) profile.availability = updateData.availability;
      if (updateData.websiteUrl !== undefined) profile.websiteUrl = updateData.websiteUrl;

      await this.em.flush(); 
      return this.getMyProfile(userId, role);

    } 
    else if (role === 'client') {
      const profile = await this.em.findOne(Clientprofiles, { user: { userId } });
      if (!profile) throw new NotFoundException('Профіль замовника не знайдено');
      
      if (updateData.companyName !== undefined) profile.companyName = updateData.companyName;
      if (updateData.bio !== undefined) profile.bio = updateData.bio;
      if (updateData.websiteUrl !== undefined) profile.websiteUrl = updateData.websiteUrl;

      await this.em.flush();
      return this.getMyProfile(userId, role);
    }

    throw new BadRequestException('Невідома роль для оновлення');
  }

  async depositFunds(userId: number, amount: number) {
    if (amount <= 0) throw new BadRequestException('Сума поповнення має бути більшою за нуль');

    return await this.em.transactional(async (em) => {
      const user = await em.findOne(Users, { userId: userId });
      if (!user) throw new BadRequestException('Користувача не знайдено');

      let wallet = await em.findOne(Userwallets, { user: user });

      if (!wallet) {
        wallet = em.create(Userwallets, { user: user, balance: '0.00' });
        em.persist(wallet);
      }

      wallet.balance = (Number(wallet.balance) + amount).toFixed(2);
      await em.flush();

      return { message: 'Баланс успішно поповнено', newBalance: wallet.balance };
    });
  }

  async getProfileById(targetUserId: number) {
    const user = await this.em.findOne(Users, { userId: targetUserId });
    
    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }
    return user;
  }
}