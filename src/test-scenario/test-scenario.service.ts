import { Injectable, NotFoundException, InternalServerErrorException  } from '@nestjs/common';
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

   async create(projectId: string, createTestScenarioDto: CreateTestScenarioDto): Promise<TestScenario> {
    return this.entityManager.transaction(async (transactionalEntityManager) => {
      const projectRepo = transactionalEntityManager.getRepository(Project);
      const project = await projectRepo.findOne({
        where: { id: projectId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!project) {
        throw new NotFoundException(`Projeto com ID ${projectId} não encontrado.`);
      }
      if (!project.prefix) {
        throw new InternalServerErrorException(`O projeto '${project.name}' não possui um prefixo configurado.`);
      }
      const nextId = project.testScenarioCounter + 1;
      project.testScenarioCounter = nextId;
      await projectRepo.save(project);

      const formattedIdentifier = `${project.prefix}-${String(nextId).padStart(3, '0')}`;

      const { testCaseIds, ...scenarioData } = createTestScenarioDto;
      const newScenario = this.testScenarioRepository.create({
        ...scenarioData,
        projectId: projectId,
        identifier: formattedIdentifier,
      });

      if (testCaseIds && testCaseIds.length > 0) {
        const testCases = await this.testCaseRepository.findBy({ id: In(testCaseIds) });
        newScenario.testCases = testCases;
      }
      
      const scenarioRepo = transactionalEntityManager.getRepository(TestScenario);
      return scenarioRepo.save(newScenario);
    });
   }

  findAll(): Promise<TestScenario[]> {
    return this.testScenarioRepository.find({ relations: ['testCases', 'project'] });
  }

  async findOne(id: string): Promise<TestScenario | null> {
    return this.testScenarioRepository.findOne({ where: { id }, relations: ['testCases', 'project'] });
  }

  async update(id: string, updateTestScenarioDto: UpdateTestScenarioDto): Promise<TestScenario> {
    const { testCaseIds, ...scenarioData } = updateTestScenarioDto;
    const scenario = await this.testScenarioRepository.findOneBy({ id });
    if (!scenario) {
      throw new NotFoundException('Cenário de teste não encontrado.');
    }

    Object.assign(scenario, scenarioData);

    if (testCaseIds) {
      const testCases = await this.testCaseRepository.findBy({ id: In(testCaseIds) });
      scenario.testCases = testCases;
    }

    return this.testScenarioRepository.save(scenario);
  }

  async remove(id: string): Promise<void> {
    const result = await this.testScenarioRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Cenário de teste não encontrado para exclusão.');
    }
  }
}