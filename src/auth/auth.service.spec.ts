import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { EntityManager } from '@mikro-orm/postgresql';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { MailerService } from './mailer.service';

describe('AuthService (Unit Tests)', () => {
  let service: AuthService;
  let em: EntityManager;

  const mockEntityManager = {
    findOne: jest.fn(),
    persist: jest.fn(),
    flush: jest.fn(),
  };

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('fake-jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: EntityManager, useValue: mockEntityManager },
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailerService, useValue: mockMailerService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    em = module.get<EntityManager>(EntityManager);
  });

  it('повинен викидати помилку, якщо паролі не співпадають', async () => {
    const dto = {
      email: 'test@test.com',
      password: 'password123',
      confirmPassword: 'differentPassword',
      full_name: 'Test User',
      role: 'freelancer'
    };

    await expect(service.register(dto as any)).rejects.toThrow(BadRequestException);
    await expect(service.register(dto as any)).rejects.toThrow('Паролі не співпадають!');
  });
});