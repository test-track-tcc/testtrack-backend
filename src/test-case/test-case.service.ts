import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TestCase } from './entities/test-case.entity';
import { CreateTestCaseDto } from './dto/create-test-case.dto';
import { UpdateTestCaseDto } from './dto/update-test-case.dto';
import { Project } from 'src/projects/entities/project.entity';
import { User } from 'src/users/entities/user.entity';
import { Script } from './entities/script.entity';
import { CustomTestType } from 'src/custom-test-types/entities/custom-test-type.entity';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/entities/notification.entity';
import { TestCaseStatus } from 'src/config/enums';
import { BugsService } from 'src/bugs/bugs.service';

@Injectable()
export class TestCasesService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(TestCase)
    private testCasesRepository: Repository<TestCase>,
    @InjectRepository(CustomTestType)
    private customTestTypeRepository: Repository<CustomTestType>,
    private readonly notificationService: NotificationService,
    private readonly bugsService: BugsService
  ) { }

  private readonly relationsToLoad = [
    'project',
    'createdBy',
    'responsible',
    'customTestType',
    'bugResponsible',
    'scripts',
    'testScenario',
  ];

  async create(createTestCaseDto: CreateTestCaseDto): Promise<TestCase> {
    const newTestCase = await this.dataSource.transaction(async (transactionalEntityManager) => {
      const {
        projectId,
        createdById,
        responsibleId,
        customTestTypeId,
        testScenarioId,
        bugResponsibleId,
        scripts: scriptPaths,
        ...testCaseData
      } = createTestCaseDto;

      const project = await transactionalEntityManager.findOne(Project, { where: { id: projectId } });
      if (!project) {
        throw new NotFoundException(`Project with ID "${projectId}" not found.`);
      }

      project.testCaseSequence = (project.testCaseSequence || 0) + 1;
      await transactionalEntityManager.save(project);

      const createdBy = await transactionalEntityManager.findOneBy(User, { id: createdById });
      if (!createdBy) {
        throw new NotFoundException(`Creator user with ID "${createdById}" not found.`);
      }

      let responsible: User | null = null;
      if (responsibleId) {
        responsible = await transactionalEntityManager.findOneBy(User, { id: responsibleId });
        if (!responsible) {
          throw new NotFoundException(`Responsible user with ID "${responsibleId}" not found.`);
        }
      }

      const newTestCase = transactionalEntityManager.create(TestCase, {
        ...testCaseData,
        project,
        createdBy,
        responsible,
        testScenarioId: testScenarioId || null,
        projectSequenceId: project.testCaseSequence,
        bugResponsibleId: bugResponsibleId || null,
      });

      if (customTestTypeId) {
        const customTestType = await this.customTestTypeRepository.findOneBy({ id: customTestTypeId });
        if (!customTestType) {
          throw new NotFoundException(`Tipo de teste personalizado com ID "${customTestTypeId}" não encontrado.`);
        }
        newTestCase.customTestType = customTestType;
        newTestCase.testType = null;
      }

      const savedTestCase = await transactionalEntityManager.save(newTestCase);

      const validScriptPaths = scriptPaths?.filter((path) => typeof path === 'string' && path.length > 0);
      if (validScriptPaths && validScriptPaths.length > 0) {
        let currentVersion = 1;
        for (const scriptPath of validScriptPaths) {
          const newScript = transactionalEntityManager.create(Script, {
            scriptPath,
            version: currentVersion++,
            testCase: savedTestCase,
            status: savedTestCase.status,
            statusSetAt: new Date()
          });
          await transactionalEntityManager.save(newScript);
        }
      }
      return savedTestCase;
    });

    if (newTestCase.responsible) {
      await this.notificationService.create(
        newTestCase.responsible,
        `Você foi atribuído ao caso de teste "${newTestCase.title}".`,
        NotificationType.TEST_CASE_ASSIGNMENT,
        `/projects/${newTestCase.project.id}/test-cases/${newTestCase.id}`,
      );
    }

    if (newTestCase.status === TestCaseStatus.REPROVED) {
      const message = `O caso de teste "${newTestCase.title}" falhou.`;
      const link = `/projects/${newTestCase.project.id}/test-cases/${newTestCase.id}`;

      if (newTestCase.createdBy) {
        await this.notificationService.create(
          newTestCase.createdBy,
          message,
          NotificationType.TEST_CASE_FAILED,
          link,
        );
      }

      if (newTestCase.project && newTestCase.project.projectUsers) {
        for (const member of newTestCase.project.projectUsers) {
          if (member.user && (!newTestCase.createdBy || String(member.user.id) !== String(newTestCase.createdBy.id))) {
            await this.notificationService.create(
              member.user,
              message,
              NotificationType.TEST_CASE_FAILED,
              link,
            );
          }
        }
      }
    }

    if (newTestCase.status === TestCaseStatus.REPROVED && newTestCase.bugResponsibleId) {
      try {
        await this.bugsService.create({
          title: `Caso de Teste com Falha: ${newTestCase.project.prefix}-${newTestCase.projectSequenceId} ${newTestCase.title}`,
          description: `Test case "${newTestCase.title}" failed execution.\n\nDescription: ${newTestCase.description}\n\nSteps: ${newTestCase.steps}\n\nExpected Result: ${newTestCase.expectedResult}`,
          priority: newTestCase.priority,
          testCaseId: newTestCase.id,
          assignedDeveloperId: newTestCase.bugResponsibleId,
        });
      } catch (error) {
        console.error(
          `Failed to automatically create bug for test case ${newTestCase.id} during creation:`,
          error,
        );
      }
    }

    return this.findOne(newTestCase.id);
  }

  findAllByProject(projectId: string): Promise<TestCase[]> {
    return this.testCasesRepository.find({
      where: { project: { id: projectId } },
      relations: this.relationsToLoad,
    });
  }

  async findOne(id: string): Promise<TestCase> {
    const testCase = await this.testCasesRepository.findOne({
      where: { id },
      relations: this.relationsToLoad,
    });

    if (!testCase) {
      throw new NotFoundException(`Caso de teste com ID ${id} não encontrado`);
    }

    return testCase;
  }

  async update(id: string, updateTestCaseDto: UpdateTestCaseDto): Promise<TestCase> {
    const currentTestCase = await this.testCasesRepository.findOne({
      where: { id },
      relations: [
        'createdBy',
        'responsible',
        'project',
        'project.projectUsers',
        'project.projectUsers.user',
        'scripts',
      ],
    });

    if (!currentTestCase) {
      throw new NotFoundException(`Test case with ID "${id}" not found.`);
    }

    const oldStatus = currentTestCase.status;
    const oldResponsibleId = currentTestCase.responsible?.id;

    const {
      scripts,
      customTestTypeId,
      testScenarioId,
      responsibleId,
      bugResponsibleId,
      status,
      ...restDto
    } = updateTestCaseDto;

    Object.assign(currentTestCase, restDto);
    
    currentTestCase.status = status ?? currentTestCase.status;

    currentTestCase.testScenarioId = testScenarioId ?? currentTestCase.testScenarioId;
    currentTestCase.bugResponsibleId = bugResponsibleId ?? null;

    if (scripts && scripts.length > 0) {
      const oldScripts = currentTestCase.scripts || [];
      const scriptRepository = this.dataSource.getRepository(Script);
      const newScriptEntities: Script[] = [];

      let latestVersion = oldScripts.reduce((max, script) => Math.max(max, script.version), 0);

      for (const scriptName of scripts) {
        latestVersion++;

        const newScript = new Script();
        newScript.scriptPath = scriptName;
        newScript.testCase = currentTestCase;
        newScript.status = currentTestCase.status;
        newScript.version = latestVersion;

        newScriptEntities.push(newScript);
      }

      if (newScriptEntities.length > 0) {
        await scriptRepository.save(newScriptEntities);
      }

      currentTestCase.scripts = [...oldScripts, ...newScriptEntities];
    }

    const testCaseToUpdate = currentTestCase;

    if (responsibleId) {
      const responsibleUser = await this.dataSource.getRepository(User).findOneBy({ id: responsibleId });
      if (!responsibleUser) throw new NotFoundException(`Responsible user with ID "${responsibleId}" not found.`);
      testCaseToUpdate.responsible = responsibleUser;
    } else if (responsibleId === null) {
      testCaseToUpdate.responsible = null;
    }

    if (customTestTypeId) {
      const customTestType = await this.customTestTypeRepository.findOneBy({ id: customTestTypeId });
      if (!customTestType) {
        throw new NotFoundException(`Tipo de teste personalizado com ID "${customTestTypeId}" não encontrado.`);
      }
      testCaseToUpdate.customTestType = customTestType;
      testCaseToUpdate.testType = null;
    } else if (restDto.testType) {
      testCaseToUpdate.customTestType = null;
    }

    testCaseToUpdate.version = (currentTestCase.version || 1) + 1;

    const updatedTestCase = await this.testCasesRepository.save(testCaseToUpdate);

    const newStatus = updatedTestCase.status;

    if (oldStatus !== newStatus && updatedTestCase.scripts && updatedTestCase.scripts.length > 0) {
        const latestScript = updatedTestCase.scripts.reduce((latest, current) => 
            current.version > latest.version ? current : latest
        );

        if (latestScript.status !== newStatus) {
            latestScript.status = newStatus;
            latestScript.statusSetAt = new Date();
            await this.dataSource.getRepository(Script).save(latestScript);
        }
    }

    if (oldStatus !== newStatus && newStatus === TestCaseStatus.REPROVED) {
      const message = `O caso de teste "${updatedTestCase.title}" falhou.`;
      const link = `/projects/${currentTestCase.project.id}/test-cases/${updatedTestCase.id}`;

      if (currentTestCase.createdBy) {
        await this.notificationService.create(
          currentTestCase.createdBy,
          message,
          NotificationType.TEST_CASE_FAILED,
          link,
        );
      }

      if (currentTestCase.project && currentTestCase.project.projectUsers) {
        for (const member of currentTestCase.project.projectUsers) {
          if (member.user && (!currentTestCase.createdBy || String(member.user.id) !== String(currentTestCase.createdBy.id))) {
            await this.notificationService.create(
              member.user,
              message,
              NotificationType.TEST_CASE_FAILED,
              link,
            );
          }
        }
      }

      if (updatedTestCase.bugResponsibleId) {
        try {
          await this.bugsService.create({
            title: `Caso de Teste com Falha: ${updatedTestCase.project.prefix}-${updatedTestCase.projectSequenceId}${updatedTestCase.title}`,
            description: `Test case "${updatedTestCase.title}" failed execution.\n\nDescription: ${updatedTestCase.description}\n\nSteps: ${updatedTestCase.steps}\n\nExpected Result: ${updatedTestCase.expectedResult}`,
            priority: updatedTestCase.priority,
            testCaseId: updatedTestCase.id,
            assignedDeveloperId: updatedTestCase.bugResponsibleId,
          });
        } catch (error) {
          console.error(
            `Failed to automatically create bug for test case ${updatedTestCase.id} during update:`,
            error,
          );
        }
      }
    }

    const newResponsibleId = updatedTestCase.responsible?.id;

    if (newResponsibleId && newResponsibleId !== oldResponsibleId && updatedTestCase.responsible) {
      await this.notificationService.create(
        updatedTestCase.responsible,
        `Você foi atribuído ao caso de teste "${updatedTestCase.title}".`,
        NotificationType.TEST_CASE_ASSIGNMENT,
        `/projects/${currentTestCase.project.id}/test-cases/${updatedTestCase.id}`
      );
    }
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.testCasesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Test case with ID "${id}" not found for deletion.`);
    }
  }

  async addScript(id: string, scriptPath: string): Promise<TestCase> {
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      const testCase = await transactionalEntityManager.findOne(TestCase, {
        where: { id },
        relations: ['scripts'],
      });
      if (!testCase) throw new NotFoundException('Test case not found.');

      const latestVersion = testCase.scripts.reduce((max, script) => Math.max(max, script.version), 0);
      const newScript = transactionalEntityManager.create(Script, {
        scriptPath,
        version: latestVersion + 1,
        testCase: testCase,
      });
      await transactionalEntityManager.save(newScript);
    });
    return this.findOne(id);
  }
}