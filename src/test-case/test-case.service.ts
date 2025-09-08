import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource  } from 'typeorm';
import { TestCase } from './entities/test-case.entity';
import { CreateTestCaseDto } from './dto/create-test-case.dto';
import { UpdateTestCaseDto } from './dto/update-test-case.dto';
import { TestCaseStatus } from '../config/enums';
import { Project } from 'src/projects/entities/project.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class TestCasesService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(TestCase)
    private testCasesRepository: Repository<TestCase>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(User) 
    private userRepository: Repository<User>, 
  ) {}

  async create(createTestCaseDto: CreateTestCaseDto): Promise<TestCase> {
    return this.dataSource.transaction(async transactionalEntityManager => {
      const { projectId, createdById, responsibleId, ...testCaseData } = createTestCaseDto;

      const project = await transactionalEntityManager.findOne(Project, {
        where: { id: projectId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!project) throw new NotFoundException(`Projeto com ID "${projectId}" não encontrado.`);

      project.testCaseSequence += 1;
      const newSequenceId = project.testCaseSequence;

      await transactionalEntityManager.save(project);

      const createdBy = await transactionalEntityManager.findOneBy(User, { id: createdById });
      if (!createdBy) throw new NotFoundException(`Usuário criador com ID "${createdById}" não encontrado.`);
      
      let responsible: User | null = null;
      if (responsibleId) {
        responsible = await transactionalEntityManager.findOneBy(User, { id: responsibleId });
      }
      
      const newTestCase = transactionalEntityManager.create(TestCase, {
        ...testCaseData,
        project,
        createdBy,
        responsible,
        projectSequenceId: newSequenceId,
      });

      return transactionalEntityManager.save(newTestCase);
    });
  }

  findAll(): Promise<TestCase[]> {
    return this.testCasesRepository.find();
  }

  async findAllByProject(projectId: string): Promise<TestCase[]> {
    return this.testCasesRepository.find({
      where: {
        project: {
          id: projectId,
        },
      },
      relations: ['project', 'createdBy', 'responsible'],
    });
  }
  async findOne(id: string): Promise<TestCase | null> {
    return this.testCasesRepository.findOne({ where: { id } });
  }

  async update(id: string, updateTestCaseDto: UpdateTestCaseDto): Promise<TestCase> {
    const testCase = await this.testCasesRepository.findOne({ where: { id } });
    if (!testCase) {
      throw new NotFoundException('Caso de teste não encontrado.');
    }
    Object.assign(testCase, updateTestCaseDto);
    return this.testCasesRepository.save(testCase);
  }

  async remove(id: string): Promise<void> {
    const result = await this.testCasesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Caso de teste não encontrado para exclusão.');
    }
  }

  async updateStatus(id: string, newStatus: TestCaseStatus): Promise<TestCase> {
    const testCase = await this.testCasesRepository.findOne({ where: { id } });
    if (!testCase) {
      throw new NotFoundException('Caso de teste não encontrado.');
    }
    testCase.status = newStatus;
    return this.testCasesRepository.save(testCase);
  }

  async addComment(id: string, idUser: string, comment: string): Promise<TestCase> {
    const testCase = await this.testCasesRepository.findOne({ where: { id } });
    if (!testCase) {
      throw new NotFoundException('Caso de teste não encontrado.');
    }

    if (!testCase.comments) {
      testCase.comments = [];
    }

    testCase.comments.push({ idUser, comment, date: new Date() });
    return this.testCasesRepository.save(testCase);
  }

  async attachEvidence(id: string, idAttachment: string): Promise<TestCase> {
    const testCase = await this.testCasesRepository.findOne({ where: { id } });
    if (!testCase) {
      throw new NotFoundException('Caso de teste não encontrado.');
    }

    if (!testCase.attachment) {
      testCase.attachment = [];
    }

    if (!testCase.attachment.includes(idAttachment)) {
      testCase.attachment.push(idAttachment);
    }
    return this.testCasesRepository.save(testCase);
  }

  async registerTimeSpent(id: string, tempo: string): Promise<TestCase> {
    const testCase = await this.testCasesRepository.findOne({ where: { id } });
    if (!testCase) {
      throw new NotFoundException('Caso de teste não encontrado.');
    }
    testCase.timeSpent = tempo;
    return this.testCasesRepository.save(testCase);
  }

  async addScript(id: string, scriptContent: string): Promise<TestCase> {
    const testCase = await this.testCasesRepository.findOne({ where: { id } });
    if (!testCase) {
      throw new NotFoundException('Caso de teste não encontrado.');
    }
    if (!testCase.scripts) {
      testCase.scripts = [];
    }
    testCase.scripts.push(scriptContent);
    return this.testCasesRepository.save(testCase);
  }
}
