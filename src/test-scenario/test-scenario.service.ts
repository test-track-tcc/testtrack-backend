import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, EntityManager } from 'typeorm';
import { TestScenario } from './entities/test-scenario.entity';
import { CreateTestScenarioDto } from './dto/create-test-scenario.dto';
import { UpdateTestScenarioDto } from './dto/update-test-scenario.dto';
import { TestCase } from '../test-case/entities/test-case.entity';
import { Project } from 'src/projects/entities/project.entity';

@Injectable()
export class TestScenarioService {
  constructor(
    @InjectRepository(TestScenario)
    private testScenarioRepository: Repository<TestScenario>,
    @InjectRepository(TestCase)
    private testCaseRepository: Repository<TestCase>,
    private readonly entityManager: EntityManager,
  ) {}

  async create(createTestScenarioDto: CreateTestScenarioDto): Promise<TestScenario> {
    const { projectId, testCaseIds, ...scenarioData } = createTestScenarioDto;

    const newScenarioEntity = await this.entityManager.transaction(async (transactionalEntityManager) => {
      const projectRepo = transactionalEntityManager.getRepository(Project);
      const project = await projectRepo.findOne({ where: { id: projectId }, lock: { mode: 'pessimistic_write' } });

      if (!project) {
        throw new NotFoundException(`Projeto com ID ${projectId} não encontrado.`);
      }

      const nextId = project.testScenarioCounter + 1;
      project.testScenarioCounter = nextId;
      await projectRepo.save(project);
      const formattedIdentifier = `${project.prefix}-${String(nextId).padStart(3, '0')}`;

      const scenarioRepo = transactionalEntityManager.getRepository(TestScenario);
      const newScenario = scenarioRepo.create({
        ...scenarioData,
        projectId: projectId,
        identifier: formattedIdentifier,
      });
      
      return scenarioRepo.save(newScenario);
    });

    const fullNewScenario = await this.findOne(newScenarioEntity.id);
    if (!fullNewScenario) {
        throw new InternalServerErrorException('Não foi possível encontrar o cenário recém-criado.');
    }
    return fullNewScenario;
  }

  findAllByProject(projectId: string): Promise<TestScenario[]> {
    return this.testScenarioRepository.find({
      where: { projectId },
      relations: ['project', 'testCases'],
    });
  }

  findOne(id: string): Promise<TestScenario | null> {
    return this.testScenarioRepository.findOne({
      where: { id },
      relations: ['project', 'testCases'],
    });
  }

  findAll(): Promise<TestScenario[]> {
    return this.testScenarioRepository.find({
      relations: ['project', 'testCases'],
    });
  }

  async update(id: string, updateTestScenarioDto: UpdateTestScenarioDto): Promise<TestScenario> {
    const { testCaseIds, ...scenarioData } = updateTestScenarioDto;
    
    await this.testScenarioRepository.update(id, scenarioData);

    const updatedScenario = await this.findOne(id);
    if (!updatedScenario) {
      throw new NotFoundException('Cenário de teste não encontrado após a atualização.');
    }
    return updatedScenario;
  }

  async remove(id: string): Promise<void> {
    const result = await this.testScenarioRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Cenário de teste não encontrado para exclusão.');
    }
  }
}