import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { CreateProjectDto } from './dto/create-project.dto';
import { Projects } from '../entities/Projects';
import { Users } from '../entities/Users';
import { Skills } from '../entities/Skills';
import { Contracts } from '../entities/Contracts';
import { Proposals } from '../entities/Proposals';
import { Disputes } from '../entities/Disputes';
import { Transactions } from '../entities/Transactions';
import { Userwallets } from '../entities/Userwallets';

@Injectable()
export class ProjectsService {
  constructor(private readonly em: EntityManager) {}

  async createProject(userId: number, role: string, dto: CreateProjectDto): Promise<any> {
    if (role !== 'client') {
      throw new ForbiddenException('Тільки користувачі з роллю "Замовник" можуть створювати проекти');
    }

    const user = await this.em.findOne(Users, { userId });
    if (!user) {
      throw new ForbiddenException('Користувача не знайдено');
    }

    if (dto.budget) {
      const wallet = await this.em.findOne(Userwallets, { user });
      if (!wallet) throw new BadRequestException('У вас немає гаманця. Спочатку створіть його в налаштуваннях.');
      
      if (Number(wallet.balance) < dto.budget) {
        throw new BadRequestException(`Недостатньо коштів на рахунку! Ваш вільний баланс: $${wallet.balance}. Потрібно для проекту: $${dto.budget}`);
      }
    }

    const project = this.em.create(Projects, {
      client: user,
      title: dto.title,
      description: dto.description,
      budget: dto.budget ? String(dto.budget) : undefined, 
      status: 'open_for_bidding',
    });

    if (dto.skillIds && dto.skillIds.length > 0) {
      const skills = await this.em.find(Skills, { skillId: { $in: dto.skillIds } });
      skills.forEach(skill => {
        project.skills.add(skill);
      });
    }

    await this.em.persist(project).flush();
    return project;
  }

  async getOpenProjects(): Promise<any> {
    return this.em.find(
      Projects,
      { status: 'open_for_bidding' },
      {
        orderBy: { projectId: 'DESC' },
        populate: ['client'],
      }
    );
  }

  async findFiltered(search?: string, minBudget?: string, maxBudget?: string, skills?: string) {
    const query: any = {};

    if (search) {
      query.$or = [
        { title: { $ilike: `%${search}%` } },
        { description: { $ilike: `%${search}%` } }
      ];
    }

    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = Number(minBudget);
      if (maxBudget) query.budget.$lte = Number(maxBudget);
    }

    if (skills) {
      const skillIds = skills.split(',').map(id => Number(id));
      query.skills = { $in: skillIds };
    }

    return await this.em.find(Projects, query, { 
      populate: ['skills', 'client'], 
      orderBy: { createdAt: 'DESC' }
    });
  }

async findMyProjects(userId: number, role: string): Promise<any[]> {
    if (role === 'client') {
      return await this.em.find(Projects, { client: { userId } }, {
        populate: ['client', 'skills', 'contract'],
        orderBy: { createdAt: 'DESC' }
      });
    } else {
      const contracts = await this.em.find(Contracts, { freelancer: { userId } }, {
        populate: ['project', 'project.client', 'project.skills'],
        orderBy: { startDate: 'DESC' }
      });

      return contracts.map(contract => {
        const originalProject = contract.project as any;
        const proj = typeof originalProject.toJSON === 'function' 
          ? originalProject.toJSON() 
          : { ...originalProject };
        
        if (contract.status === 'active') {
          proj.status = 'in_progress'; 
        } else if (contract.status === 'completed') {
          proj.status = 'completed';
        }

        proj.contractId = contract.contractId;
        proj.contract = { contractId: contract.contractId };
        
        return proj;
      });
    }
  }

  async updateProject(projectId: number, userId: number, dto: { title: string; description: string; budget: number }) {
    const project = await this.em.findOne(Projects, { projectId }, { populate: ['client'] });

    if (!project) {
      throw new NotFoundException('Проект не знайдено');
    }

    if (project.client.userId !== userId) {
      throw new ForbiddenException('Ви можете редагувати тільки свої проекти');
    }

    if (project.status !== 'open_for_bidding') {
      throw new ForbiddenException('Редагувати можна тільки проекти у статусі пошуку виконавця');
    }

    project.title = dto.title;
    project.description = dto.description;
    if (dto.budget) {
      project.budget = String(dto.budget);
    }

    await this.em.persistAndFlush(project);
    return project;
  }

  async acceptProposal(proposalId: number, clientId: number) {
    return await this.em.transactional(async (em) => {
      const proposal = await em.findOne(Proposals, { proposalId }, { populate: ['project', 'freelancer', 'project.client'] });
      
      if (!proposal) throw new NotFoundException('Заявку не знайдено');
      if (proposal.project.client.userId !== clientId) throw new ForbiddenException('Тільки власник проекту може прийняти заявку');
      if (proposal.project.status !== 'open_for_bidding') throw new BadRequestException('Проект вже в роботі або завершений');

      if (!proposal.bidAmount) {
        throw new BadRequestException('У заявці не вказана сума виконання');
      }

      const agreedAmount = Number(proposal.bidAmount);

      const clientWallet = await em.findOne(Userwallets, { user: proposal.project.client });
      if (!clientWallet) throw new BadRequestException('Гаманець замовника не знайдено');
      
      if (Number(clientWallet.balance) < agreedAmount) {
        throw new BadRequestException(`На вашому балансі $${clientWallet.balance}. Потрібно $${agreedAmount} для укладання контракту. Поповніть рахунок.`);
      }

      clientWallet.balance = (Number(clientWallet.balance) - agreedAmount).toFixed(2);

      const contract = em.create(Contracts, {
        project: proposal.project,
        client: proposal.project.client,
        freelancer: proposal.freelancer,
        agreedAmount: proposal.bidAmount,
        status: 'active',
        startDate: new Date(),
        proposal: proposal
      });

      const txHold = em.create(Transactions, {
        wallet: clientWallet, 
        contract, 
        amount: String(-agreedAmount), 
        type: 'payment_sent',
        status: 'completed'
      });

      proposal.status = 'accepted';
      proposal.project.status = 'in_progress';

      em.persist([contract, txHold]);
      return contract;
    });
  }

  async completeContractAndPay(contractId: number, clientId: number) {
    return await this.em.transactional(async (em) => {
      const contract = await em.findOne(Contracts, { contractId }, { populate: ['client', 'freelancer', 'project'] });
      
      if (!contract) throw new NotFoundException('Контракт не знайдено');
      if (contract.client.userId !== clientId) throw new ForbiddenException('Тільки замовник може завершити контракт');
      if (contract.status !== 'active') throw new BadRequestException('Тільки активний контракт можна завершити');

      const amount = Number(contract.agreedAmount || 0);
      if (amount <= 0) throw new BadRequestException('Сума контракту не встановлена');

      const freelancerWallet = await em.findOne(Userwallets, { user: contract.freelancer });
      if (!freelancerWallet) throw new BadRequestException('Гаманець виконавця не знайдено');

      freelancerWallet.balance = (Number(freelancerWallet.balance) + amount).toFixed(2);

      const txIn = em.create(Transactions, {
        wallet: freelancerWallet, 
        contract, 
        amount: String(amount), 
        type: 'payment_received', 
        status: 'completed'
      });

      contract.status = 'completed';
      contract.endDate = new Date();
      contract.project.status = 'completed';

      em.persist(txIn);
      return { message: 'Оплата успішна, контракт завершено' };
    });
  }

  async openDispute(contractId: number, userId: number, reason: string) {
    const contract = await this.em.findOne(Contracts, { contractId }, { populate: ['client', 'freelancer', 'project'] });
    if (!contract) throw new NotFoundException('Контракт не знайдено');

    if (contract.client.userId !== userId && contract.freelancer.userId !== userId) {
      throw new ForbiddenException('Ви не є учасником цього контракту');
    }

    contract.status = 'disputed';
    const dispute = this.em.create(Disputes, {
      contract,
      reportedBy: { userId } as any,
      reason,
      status: 'open'
    });

    await this.em.persistAndFlush(dispute);
    return dispute;
  }

  async getContractDetails(contractId: number, userId: number): Promise<any> {
    const contract = await this.em.findOne(Contracts, { contractId }, {
      populate: ['project', 'client', 'freelancer', 'project.client']
    });

    if (!contract) {
      throw new NotFoundException('Контракт не знайдено');
    }

    if (contract.client.userId !== userId && contract.freelancer.userId !== userId) {
      throw new ForbiddenException('Ви не є учасником цього контракту');
    }

    return contract;
  }

  async getPublicStats() {
    const totalProjects = await this.em.count(Projects);
    
    const totalClients = await this.em.count(Users, { 
      roles: { roleName: 'client' } 
    });

    const totalFreelancers = await this.em.count(Users, { 
      roles: { roleName: 'freelancer' } 
    });

    return { totalProjects, totalFreelancers, totalClients };
  }

}