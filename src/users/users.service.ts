import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { RequiredEntityData } from '@mikro-orm/core';
import { Users } from '../entities/Users';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: EntityRepository<Users>,
  ) {}

  async findByEmail(email: string): Promise<Users | null> {
    return this.userRepository.findOne({ email });
  }

  async create(userData: RequiredEntityData<Users>): Promise<Users> {
    const user = this.userRepository.create(userData);
    await this.userRepository.getEntityManager().persist(user).flush(); 
    return user;
  }
}