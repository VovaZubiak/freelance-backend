import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Team } from '../entities/Team';
import { TeamMember } from '../entities/TeamMember';
import { TeamMessage } from '../entities/TeamMessage';
import { Users } from '../entities/Users';

@Injectable()
export class TeamsService {
  constructor(private readonly em: EntityManager) {}

  async createTeam(userId: number, name: string, description?: string) {
    return await this.em.transactional(async (em) => {
      const owner = await em.findOne(Users, { userId });
      if (!owner) throw new NotFoundException('Пользователь не найден');

      const existing = await em.findOne(Team, { name });
      if (existing) throw new BadRequestException('Команда с таким названием уже существует');

      const team = em.create(Team, { name, description, owner });
      em.persist(team);

      const member = em.create(TeamMember, { team, user: owner, role: 'owner', joinedAt: new Date() });
      em.persist(member);

      await em.flush();
      return { message: 'Команда успешно создана!', teamId: team.teamId };
    });
  }

  async getTeamInfo(teamId: number) {
    const team = await this.em.findOne(Team, { teamId }, { populate: ['owner', 'members.user'] });
    if (!team) throw new NotFoundException('Команда не найдена');
    return team;
  }

  async addMember(ownerId: number, teamId: number, targetUserId: number) {
    const team = await this.em.findOne(Team, { teamId }, { populate: ['owner'] });
    if (!team) throw new NotFoundException('Команда не найдена');
    
    if (team.owner.userId !== ownerId) throw new ForbiddenException('Только лидер может приглашать участников');

    const targetUser = await this.em.findOne(Users, { userId: targetUserId });
    if (!targetUser) throw new NotFoundException('Фрилансер не найден');

    const existingMember = await this.em.findOne(TeamMember, { team, user: targetUser });
    if (existingMember) throw new BadRequestException('Этот фрилансер уже в команде');

    const member = this.em.create(TeamMember, { team, user: targetUser, role: 'member', joinedAt: new Date() });
    await this.em.persistAndFlush(member);

    return { message: 'Участник успешно добавлен в команду' };
  }

  async removeMember(ownerId: number, teamId: number, targetUserId: number) {
    const team = await this.em.findOne(Team, { teamId }, { populate: ['owner'] });
    if (!team) throw new NotFoundException('Команда не найдена');
    
    if (team.owner.userId !== ownerId) throw new ForbiddenException('Только лидер может удалять участников');
    if (ownerId === targetUserId) throw new BadRequestException('Нельзя удалить самого себя');

    const member = await this.em.findOne(TeamMember, { team, user: targetUserId });
    if (!member) throw new NotFoundException('Этот пользователь не состоит в вашей команде');

    await this.em.removeAndFlush(member);
    return { message: 'Участник удален из команды' };
  }

  async sendMessage(userId: number, teamId: number, content: string) {
    const team = await this.em.findOne(Team, { teamId });
    const user = await this.em.findOne(Users, { userId });
    
    if (!team || !user) throw new NotFoundException('Команду або користувача не знайдено');

    const isMember = await this.em.findOne(TeamMember, { team, user });
    if (!isMember) throw new ForbiddenException('Ви не перебуваєте в цій команді');

    const message = this.em.create(TeamMessage, { team, sender: user, content, createdAt: new Date() });
    await this.em.persistAndFlush(message);
    return message;
  }

  async getMessages(userId: number, teamId: number) {
    const team = await this.em.findOne(Team, { teamId });
    const user = await this.em.findOne(Users, { userId });
    
    if (!team || !user) throw new NotFoundException('Команду або користувача не знайдено');

    const isMember = await this.em.findOne(TeamMember, { team, user });
    if (!isMember) throw new ForbiddenException('Доступ до чату заборонено');

    return await this.em.find(TeamMessage, { team }, { populate: ['sender'], orderBy: { createdAt: 'ASC' } });
  }

  async searchFreelancers(query: string) {
    return await this.em.find(Users, {
      fullName: { $ilike: `%${query}%` },
      roles: { roleId: 2 } 
    }, { 
      fields: ['userId', 'fullName', 'avatarUrl'] 
    });
  }
}