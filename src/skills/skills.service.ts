import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Skills } from '../entities/Skills';

@Injectable()
export class SkillsService {
  constructor(private readonly em: EntityManager) {}

  async findAll() {
    return await this.em.find(Skills, {});
  }
}