import { Test, TestingModule } from '@nestjs/testing';
import { ContractsService } from './contracts.service';
import { EntityManager } from '@mikro-orm/postgresql';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('ContractsService (Unit Tests)', () => {
  let service: ContractsService;
  let em: EntityManager;

  const mockEntityManager = {
    findOne: jest.fn(),
    create: jest.fn(),
    persistAndFlush: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractsService,
        { provide: EntityManager, useValue: mockEntityManager },
      ],
    }).compile();

    service = module.get<ContractsService>(ContractsService);
    em = module.get<EntityManager>(EntityManager);
  });

  it('повинен забороняти фрілансеру укладати контракт (ForbiddenException)', async () => {
    const dto = { proposalId: 1 };
    
    await expect(service.acceptProposal(1, 'freelancer', dto))
      .rejects.toThrow(ForbiddenException);
      
    await expect(service.acceptProposal(1, 'freelancer', dto))
      .rejects.toThrow('Тільки замовники можуть укладати контракти');
  });

  it('повинен викидати NotFoundException, якщо ставки не існує', async () => {
    jest.spyOn(em, 'findOne').mockResolvedValue(null);

    const dto = { proposalId: 999 };
    
    await expect(service.acceptProposal(1, 'client', dto))
      .rejects.toThrow(NotFoundException);
  });
});