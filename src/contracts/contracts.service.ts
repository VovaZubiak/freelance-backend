import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Contracts } from '../entities/Contracts';
import { Projects } from '../entities/Projects';
import { Proposals } from '../entities/Proposals';
import { Userwallets } from '../entities/Userwallets';
import { Transactions } from '../entities/Transactions';
import { AcceptProposalDto } from './dto/accept-proposal.dto';

@Injectable()
export class ContractsService {
  constructor(private readonly em: EntityManager) {}

  async acceptProposal(userId: number, role: string, dto: AcceptProposalDto) {
    if (role !== 'client') {
      throw new ForbiddenException('Тільки замовники можуть укладати контракти');
    }

    const proposal = await this.em.findOne(
      Proposals, 
      { proposalId: dto.proposalId }, 
      { populate: ['project', 'project.client', 'freelancer'] }
    );
    
    if (!proposal) throw new NotFoundException('Ставку не знайдено');
    const project = proposal.project;

    if (project.client.userId !== userId) {
      throw new ForbiddenException('Ви не є власником цього проекту');
    }

    if (project.status !== 'open_for_bidding') {
      throw new BadRequestException('Цей проект вже в роботі або закритий');
    }

    const agreedAmount = Number(proposal.bidAmount);

    const clientWallet = await this.em.findOne(Userwallets, { user: project.client });
    if (!clientWallet) throw new BadRequestException('Ваш гаманець не знайдено');

    if (Number(clientWallet.balance) < agreedAmount) {
      throw new BadRequestException(`Недостатньо коштів. Ваш баланс: $${clientWallet.balance}, потрібно: $${agreedAmount} для укладання контракту. Будь ласка, поповніть рахунок.`);
    }

    clientWallet.balance = (Number(clientWallet.balance) - agreedAmount).toFixed(2);

    proposal.status = 'accepted';
    project.status = 'in_progress';

    const contract = this.em.create(Contracts, {
      project: project,
      proposal: proposal,
      client: project.client,
      freelancer: proposal.freelancer,
      agreedAmount: proposal.bidAmount as string,
      status: 'active',
      startDate: new Date()
    });

    const txHold = this.em.create(Transactions, {
      wallet: clientWallet, 
      contract, 
      amount: String(-agreedAmount), 
      type: 'payment_sent', 
      status: 'completed'
    });

    this.em.persist([contract, txHold]);
    await this.em.flush();

    return contract;
  }
}