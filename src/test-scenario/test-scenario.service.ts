import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { TestScenario } from './entities/test-scenario.entity';
import { CreateTestScenarioDto } from './dto/create-test-scenario.dto';
import { UpdateTestScenarioDto } from './dto/update-test-scenario.dto';
import { TestCase } from '../test-case/entities/test-case.entity';

@Injectable()
export class TestScenarioService {
  constructor(
    @InjectRepository(TestScenario)
    private testScenarioRepository: Repository<TestScenario>,
    @InjectRepository(TestCase)
    private testCaseRepository: Repository<TestCase>,
  ) {}

  async create(createTestScenarioDto: CreateTestScenarioDto): Promise<TestScenario> {
    const { testCaseIds, ...scenarioData } = createTestScenarioDto;
    const newScenario = this.testScenarioRepository.create(scenarioData);

    if (testCaseIds && testCaseIds.length > 0) {
      const testCases = await this.testCaseRepository.findBy({ id: In(testCaseIds) });
      newScenario.testCases = testCases;
    }

    return this.testScenarioRepository.save(newScenario);
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