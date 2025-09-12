import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TestCase } from './entities/test-case.entity';
import { CreateTestCaseDto } from './dto/create-test-case.dto';
import { UpdateTestCaseDto } from './dto/update-test-case.dto';
import { TestCaseStatus } from '../config/enums';
import { Project } from 'src/projects/entities/project.entity';
import { User } from 'src/users/entities/user.entity';
import { Script } from './entities/script.entity';

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
    @InjectRepository(Script)
    private scriptRepository: Repository<Script>,
  ) {}

  async create(createTestCaseDto: CreateTestCaseDto): Promise<TestCase> {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const {
        projectId,
        createdById,
        responsibleId,
        scripts: scriptPaths,
        ...testCaseData
      } = createTestCaseDto;

      const project = await transactionalEntityManager.findOne(Project, { where: { id: projectId } });
      if (!project) throw new NotFoundException(`Projeto com ID "${projectId}" não encontrado.`);

      project.testCaseSequence = (project.testCaseSequence || 0) + 1;
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

      const savedTestCase = await transactionalEntityManager.save(newTestCase);
      
      const validScriptPaths = scriptPaths?.filter(path => typeof path === 'string' && path.length > 0);

      if (validScriptPaths && validScriptPaths.length > 0) {
        savedTestCase.scripts = [];
        for (const scriptPath of validScriptPaths) {
          const newScript = transactionalEntityManager.create(Script, {
            scriptPath,
            version: 1,
            testCase: savedTestCase,
          });
          const savedScript = await transactionalEntityManager.save(newScript);
          savedTestCase.scripts.push(savedScript);
        }
      }

      return savedTestCase;
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

  async addScript(id: string, scriptPath: string): Promise<TestCase> {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const testCase = await transactionalEntityManager.findOne(TestCase, {
        where: { id },
        relations: ['scripts'],
      });
      if (!testCase) {
        throw new NotFoundException('Caso de teste não encontrado.');
      }

      const latestVersion = testCase.scripts.reduce(
        (max, script) => Math.max(max, script.version),
        0,
      );

      const newScript = transactionalEntityManager.create(Script, {
        scriptPath,
        version: latestVersion + 1,
        testCase: testCase,
      });

      await transactionalEntityManager.save(newScript);

      const updatedTestCase = await transactionalEntityManager.findOne(TestCase, {
        where: { id },
        relations: ['scripts'],
      });

      if (!updatedTestCase) {
        throw new NotFoundException('O caso de teste não foi encontrado após salvar o script.');
      }

      return updatedTestCase;
    });
  }
}