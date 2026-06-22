import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { Proposals } from '../entities/Proposals'; 
import { Projects } from '../entities/Projects';
import { Users } from '../entities/Users';

@Injectable()
export class ProposalsService {
  constructor(private readonly em: EntityManager) {}

  async createProposal(userId: number, role: string, dto: CreateProposalDto) {
    const project = await this.em.findOne(Projects, { projectId: dto.projectId });
    if (!project) throw new NotFoundException('Проект не знайдено');
    
    if (project.status !== 'open_for_bidding') {
      throw new BadRequestException('Цей проект наразі не приймає нових заявок');
    }

    const freelancer = await this.em.findOne(Users, { userId });
    if (!freelancer) throw new NotFoundException('Користувача не знайдено');

    await freelancer.roles.init();

    const userRoles = freelancer.roles.getItems().map(r => r.roleName.trim().toLowerCase());
    
    console.log(`[DEBUG] Ролі користувача ID ${userId}:`, userRoles);

    if (!userRoles.includes('freelancer')) {
      throw new ForbiddenException(`Тільки Фрілансери можуть подавати заявки. Ваші поточні ролі в базі: [${userRoles.join(', ')}]`);
    }

    const existingProposal = await this.em.findOne(Proposals, {
      project: project,
      freelancer: freelancer
    });
    if (existingProposal) {
      throw new BadRequestException('Ви вже подали заявку на цей проект');
    }

    const proposal = this.em.create(Proposals, {
      project: project,
      freelancer: freelancer,
      coverLetter: dto.coverLetter,
      bidAmount: String(dto.bidAmount),
      estimatedTimeDays: dto.estimatedTimeDays,
      status: 'pending',
    });

    await this.em.persist(proposal).flush();
    return proposal;
  }

  async getProjectProposals(projectId: number, userId: number, role: string) {
    if (role?.toLowerCase() !== 'client') {
       // throw new ForbiddenException('Тільки замовники можуть переглядати заявки');
    }

    return this.em.find(
      Proposals,
      { project: { projectId } },
      { populate: ['freelancer', 'freelancer.freelancerProfile'] }
    );
  }

  async cancelProposal(userId: number, role: string, projectId: number) {
    const user = await this.em.findOne(Users, { userId }, { populate: ['roles'] });
    const hasFreelancerRole = user?.roles.getItems().some(r => r.roleName.toLowerCase() === 'freelancer');

    if (!hasFreelancerRole) {
      throw new ForbiddenException('Тільки фрілансери можуть відміняти заявки');
    }

    const proposal = await this.em.findOne(Proposals, {
      project: { projectId },
      freelancer: { userId }
    });

    if (!proposal) {
      throw new NotFoundException('Ваш відгук на цей проект не знайдено');
    }

    await this.em.removeAndFlush(proposal);
    return { message: 'Відгук успішно скасовано' };
  }
}