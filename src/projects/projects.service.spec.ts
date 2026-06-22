import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { EntityManager } from '@mikro-orm/postgresql';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
describe('ProjectsService (Unit Tests)', () => {
  let service: ProjectsService;
  let em: EntityManager;

  const mockEntityManager = {
    findOne: jest.fn(),
    create: jest.fn(),
    persist: jest.fn().mockReturnThis(), 
    flush: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: EntityManager, useValue: mockEntityManager },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    em = module.get<EntityManager>(EntityManager);
  });

  it('повинен успішно створювати проект', async () => {
    const dto = { title: 'Test Project', description: 'Test', budget: 500, skills: [1] };
    const fakeClient = { userId: 1, role: 'client' };
    const newProject = { projectId: 1, ...dto };

    jest.spyOn(em, 'findOne').mockResolvedValue(fakeClient as any);
    jest.spyOn(em, 'create').mockReturnValue(newProject as any);

    const result = await service.createProject(1, 'client', dto as any);

    expect(em.create).toHaveBeenCalled();
    expect(em.persist).toHaveBeenCalled(); 
    expect(em.flush).toHaveBeenCalled();
    expect(result).toEqual(newProject);
  });
});