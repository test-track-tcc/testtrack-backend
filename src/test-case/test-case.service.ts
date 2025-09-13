import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TestCase } from './entities/test-case.entity';
import { CreateTestCaseDto } from './dto/create-test-case.dto';
import { UpdateTestCaseDto } from './dto/update-test-case.dto';
import { Project } from 'src/projects/entities/project.entity';
import { User } from 'src/users/entities/user.entity';
import { Script } from './entities/script.entity';

@Injectable()
export class TestCasesService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(TestCase)
    private testCasesRepository: Repository<TestCase>,
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
      if (!project) throw new NotFoundException(`Project with ID "${projectId}" not found.`);

      project.testCaseSequence = (project.testCaseSequence || 0) + 1;
      const newSequenceId = project.testCaseSequence;
      await transactionalEntityManager.save(project);

      const createdBy = await transactionalEntityManager.findOneBy(User, { id: createdById });
      if (!createdBy) throw new NotFoundException(`Creator user with ID "${createdById}" not found.`);

      let responsible: User | null = null;
      if (responsibleId) {
        responsible = await transactionalEntityManager.findOneBy(User, { id: responsibleId });
        if (!responsible) throw new NotFoundException(`Responsible user with ID "${responsibleId}" not found.`);
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
        for (const scriptPath of validScriptPaths) {
          const newScript = transactionalEntityManager.create(Script, {
            scriptPath,
            version: 1,
            testCase: savedTestCase,
          });
          await transactionalEntityManager.save(newScript);
        }
      }

      // --- A CORREÇÃO ESTÁ AQUI ---
      // Após salvar tudo, buscamos o caso de teste novamente do banco de dados.
      // Isso garante que a relação 'eager' com os scripts seja carregada corretamente.
      const result = await transactionalEntityManager.findOne(TestCase, {
          where: { id: savedTestCase.id },
      });

      if (!result) {
        // Esta verificação é uma boa prática, embora seja improvável que falhe aqui.
        throw new NotFoundException('Failed to retrieve the test case after creation.');
      }

      // Retornamos o resultado completo e atualizado.
      return result;
    });
  }

  findAllByProject(projectId: string): Promise<TestCase[]> {
    return this.testCasesRepository.find({
      where: { project: { id: projectId } },
      relations: ['project', 'createdBy', 'responsible'],
    });
  }

  findOne(id: string): Promise<TestCase | null> {
    return this.testCasesRepository.findOne({ where: { id }, relations: ['scripts', 'createdBy', 'responsible', 'project'] });
  }

  async update(id: string, updateTestCaseDto: UpdateTestCaseDto): Promise<TestCase> {
    // Remove 'scripts' from updateTestCaseDto to avoid type mismatch
    const { scripts, ...restDto } = updateTestCaseDto;
    const testCase = await this.testCasesRepository.preload({
        id: id,
        ...restDto,
    });
    if (!testCase) {
      throw new NotFoundException(`Test case with ID "${id}" not found.`);
    }
    return this.testCasesRepository.save(testCase);
  }

  async remove(id: string): Promise<void> {
    const result = await this.testCasesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Test case with ID "${id}" not found for deletion.`);
    }
  }
  
  async addScript(id: string, scriptPath: string): Promise<TestCase> {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const testCase = await transactionalEntityManager.findOne(TestCase, {
        where: { id },
        relations: ['scripts'],
      });
      if (!testCase) {
        throw new NotFoundException('Test case not found.');
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
        throw new NotFoundException('Test case not found after saving the script.');
      }

      return updatedTestCase;
    });
  }
}