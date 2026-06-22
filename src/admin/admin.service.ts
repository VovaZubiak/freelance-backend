import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Users } from '../entities/Users';
import { Disputes } from '../entities/Disputes';
import { Contracts } from '../entities/Contracts';
import { Projects } from '../entities/Projects';
import { Userwallets } from '../entities/Userwallets';
import { Transactions } from '../entities/Transactions';
import { Messages } from '../entities/Messages';

@Injectable()
export class AdminService {
  constructor(private readonly em: EntityManager) {}

  async getDashboardStats(adminRole: string) {
    if (adminRole !== 'admin') throw new ForbiddenException('Доступ заборонено');

    const totalUsers = await this.em.count(Users);
    const totalProjects = await this.em.count(Projects);
    const activeContracts = await this.em.count(Contracts, { status: 'active' });
    const openDisputes = await this.em.count(Disputes, { status: 'open' });

    const contracts = await this.em.find(Contracts, {}, { orderBy: { startDate: 'ASC' } });
    const chartDataMap = new Map<string, number>();

    contracts.forEach(c => {
      const date = c.startDate ? new Date(c.startDate).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' }) : 'Unknown';
      const amount = Number(c.agreedAmount || 0);
      chartDataMap.set(date, (chartDataMap.get(date) || 0) + amount);
    });

    const chartData = Array.from(chartDataMap.entries()).map(([date, amount]) => ({ name: date, volume: amount }));
    const finalChartData = chartData.length > 0 ? chartData : [{ name: 'Сьогодні', volume: 0 }];

    return { totalUsers, totalProjects, activeContracts, openDisputes, chartData: finalChartData };
  }

  async getAllUsers(adminRole: string) {
    if (adminRole !== 'admin') throw new ForbiddenException('Доступ заборонено');
    return this.em.find(Users, {}, { orderBy: { registrationDate: 'DESC' } });
  }

  async toggleUserStatus(adminRole: string, targetUserId: number) {
    if (adminRole !== 'admin') throw new ForbiddenException('Доступ заборонено');
    const user = await this.em.findOne(Users, { userId: targetUserId });
    if (!user) throw new NotFoundException('Користувача не знайдено');
    user.isActive = !user.isActive;
    await this.em.persistAndFlush(user);
    return { message: `Користувача ${user.fullName} ${user.isActive ? 'розблоковано' : 'заблоковано'}`, isActive: user.isActive };
  }

  async sendMessageToUser(adminRole: string, adminId: number, targetUserId: number, content: string) {
    if (adminRole !== 'admin') throw new ForbiddenException('Доступ заборонено');
    const sender = await this.em.findOne(Users, { userId: adminId });
    const receiver = await this.em.findOne(Users, { userId: targetUserId });
    if (!receiver || !sender) throw new NotFoundException('Користувача не знайдено');

    const msg = this.em.create(Messages, {
      sender,
      receiver,
      messageBody: `⚠️ Повідомлення від Адміністрації: ${content}`
    });
    await this.em.persistAndFlush(msg);
    return { message: 'Повідомлення надіслано' };
  }

  async getContractChat(adminRole: string, contractId: number) {
    if (adminRole !== 'admin') throw new ForbiddenException('Доступ заборонено');
    return this.em.find(Messages, { contract: { contractId } }, {
      orderBy: { sentAt: 'ASC' },
      populate: ['sender', 'attachedFile']
    });
  }

  async getAllDisputes(adminRole: string) {
    if (adminRole !== 'admin') throw new ForbiddenException('Доступ заборонено');
    return this.em.find(Disputes, {}, { 
      populate: ['contract', 'contract.project', 'contract.client', 'contract.freelancer', 'reportedBy'],
      orderBy: { createdAt: 'DESC' }
    });
  }

  async resolveDispute(adminRole: string, disputeId: number, winner: 'client' | 'freelancer', resolutionText: string) {
    if (adminRole !== 'admin') throw new ForbiddenException('Доступ заборонено');

    return await this.em.transactional(async (em) => {
      const dispute = await em.findOne(Disputes, { disputeId: disputeId }, { populate: ['contract', 'contract.client', 'contract.freelancer', 'contract.project'] });
      if (!dispute) throw new NotFoundException('Спір не знайдено');
      if (dispute.status === 'resolved') throw new BadRequestException('Цей спір вже вирішено');

      const contract = dispute.contract;
      const amount = Number(contract.agreedAmount || 0);

      let clientWallet = await em.findOne(Userwallets, { user: contract.client.userId });
      let freelancerWallet = await em.findOne(Userwallets, { user: contract.freelancer.userId });

      if (!clientWallet) {
        clientWallet = em.create(Userwallets, { user: contract.client, balance: '0.00' });
        em.persist(clientWallet);
      }
      
      if (!freelancerWallet) {
        freelancerWallet = em.create(Userwallets, { user: contract.freelancer, balance: '0.00' });
        em.persist(freelancerWallet);
      }

      if (!clientWallet || !freelancerWallet) throw new BadRequestException('Помилка гаманців користувачів');

      if (winner === 'client') {
        clientWallet.balance = (Number(clientWallet.balance) + amount).toFixed(2);
        const txRefund = em.create(Transactions, { wallet: clientWallet, contract, amount: String(amount), type: 'refund', status: 'completed' });
        em.persist(txRefund);
        contract.status = 'cancelled';
        contract.project.status = 'open_for_bidding'; 
      } else {
        freelancerWallet.balance = (Number(freelancerWallet.balance) + amount).toFixed(2);
        const txPay = em.create(Transactions, { wallet: freelancerWallet, contract, amount: String(amount), type: 'payment_received', status: 'completed' });
        em.persist(txPay);
        contract.status = 'completed';
        contract.project.status = 'completed';
      }

      dispute.status = 'resolved';
      dispute.resolutionNotes = resolutionText; 
      em.persist([contract, dispute]);
      return { message: 'Спір успішно вирішено.', dispute };
    });
  }
}