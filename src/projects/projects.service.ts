import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { User } from '../users/entities/user.entity';
import { Organization } from '../organization/entities/organization.entity';
import { ProjectUser, ProjectRole } from './entities/project-user.entity';
import { AddUserToProjectDto } from './dto/add-users-to-project.dto';
import { Permission } from '../permission/entities/permission.entity';
import { Report } from '../reports/entities/report.entity';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../notification/entities/notification.entity';

function generatePrefix(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 10);
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationsRepository: Repository<Organization>,
    @InjectRepository(ProjectUser)
    private projectUsersRepository: Repository<ProjectUser>,
    @InjectRepository(Permission)
    private permissionRepo: Repository<Permission>,
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
    private readonly dataSource: DataSource,
    private readonly notificationService: NotificationService,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const {
      name,
      description,
      organizationId,
      ownerId,
      startDate,
      estimateEnd,
      status,
    } = createProjectDto;

    const prefix = generatePrefix(createProjectDto.name);

    const organization = await this.organizationsRepository.findOne({
      where: { id: organizationId },
    });
    if (!organization) {
      throw new NotFoundException(
        `Organization with ID "${organizationId}" not found`,
      );
    }

    const owner = await this.usersRepository.findOne({ where: { id: ownerId } });
    if (!owner) {
      throw new NotFoundException(`User with ID "${ownerId}" not found`);
    }

    return this.dataSource.transaction(async (entityManager) => {
      const permissionName = `Acesso - Projeto ${name}`;
      const newPermission = entityManager.create(Permission, {
        name: permissionName,
        description: `Permissão de acesso para o projeto ${name}.`,
        createdBy: owner,
      });
      const savedPermission = await entityManager.save(newPermission);

      const newProject = entityManager.create(Project, {
        name: name,
        description: description,
        organization: organization,
        owner: owner,
        permission: savedPermission,
        prefix: prefix,
        startDate: startDate,
        estimateEnd: estimateEnd,
        status: status,
      });

      const savedProject = await entityManager.save(newProject);

      savedPermission.project = savedProject;
      await entityManager.save(savedPermission);

      const projectUser = entityManager.create(ProjectUser, {
        project: savedProject,
        user: owner,
        role: ProjectRole.ADMIN,
      });

      await entityManager.save(projectUser);

      return savedProject;
    });
  }

  findAll(): Promise<Project[]> {
    return this.projectsRepository.find({
      relations: ['organization', 'owner'],
    });
  }

  async findAllByOrganization(organizationId: string): Promise<Project[]> {
    return this.projectsRepository.find({
      where: {
        organization: {
          id: organizationId,
        },
      },
      relations: ['organization', 'owner'], 
    });
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['organization', 'owner'],
    });
    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }
    return project;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    const project = await this.projectsRepository.preload({
      id: id,
      ...updateProjectDto,
    });

    if (!project) {
      throw new NotFoundException(`Projeto com ID "${id}" não encontrado`);
    }

    if (updateProjectDto.organizationId) {
      const organization = await this.organizationsRepository.findOne({
        where: { id: updateProjectDto.organizationId },
      });
      if (!organization) {
        throw new NotFoundException(
          `Organização com ID "${updateProjectDto.organizationId}" não encontrada`,
        );
      }
      project.organization = organization;
    }

    if (updateProjectDto.ownerId) {
      const owner = await this.usersRepository.findOne({
        where: { id: updateProjectDto.ownerId },
      });
      if (!owner) {
        throw new NotFoundException(
          `Usuário com ID "${updateProjectDto.ownerId}" não encontrado`,
        );
      }
      project.owner = owner;

    }

    if (updateProjectDto.startDate !== undefined) {
      const dateStr = String(updateProjectDto.startDate);
      project.startDate = dateStr.includes('T')
        ? new Date(dateStr)
        : new Date(`${dateStr}T12:00:00`);
    }

    if (updateProjectDto.estimateEnd !== undefined) {
      const dateStr = String(updateProjectDto.estimateEnd);
      project.estimateEnd = dateStr.includes('T')
        ? new Date(dateStr)
        : new Date(`${dateStr}T12:00:00`);
    }

    if (updateProjectDto.conclusionDate !== undefined) {
        if (updateProjectDto.conclusionDate === null) {
            project.conclusionDate = null;
        } else {
            const dateStr = String(updateProjectDto.conclusionDate);
            project.conclusionDate = dateStr.includes('T')
              ? new Date(dateStr)
              : new Date(`${dateStr}T12:00:00`);
        }
}

    return this.projectsRepository.save(project);
  }

  async remove(id: string): Promise<void> {
    const result = await this.projectsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }
  }

  async addUserToProject(
    projectId: string,
    addUserToProjectDto: AddUserToProjectDto,
  ): Promise<ProjectUser> {
    const { userId } = addUserToProjectDto;

    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
      relations: ['organization'],
    });

    if (!project) {
      throw new NotFoundException(`Projeto com ID "${projectId}" não encontrado`);
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['organizationUsers', 'organizationUsers.organization'],
    });

    if (!user) {
      throw new NotFoundException(`Utilizador com ID "${userId}" não encontrado`);
    }

    const isUserInOrg = user.organizationUsers.some(
      (orgUser) => orgUser.organization.id === project.organization.id,
    );

    if (!isUserInOrg) {
      throw new BadRequestException(
        `O utilizador ${user.name} não pertence à organização "${project.organization.name}".`,
      );
    }

    const existingProjectUser = await this.projectUsersRepository.findOne({
      where: {
        project: { id: projectId },
        user: { id: userId },
      },
    });

    if (existingProjectUser) {
      throw new BadRequestException(
        `O utilizador ${user.name} já faz parte deste projeto.`,
      );
    }

    const newProjectUser = this.projectUsersRepository.create({
      project,
      user,
    });

    const savedProjectUser = await this.projectUsersRepository.save(newProjectUser);

    // --- LÓGICA DE NOTIFICAÇÃO (RQ31) ---
    await this.notificationService.create(
      user, // O usuário que foi adicionado
      `Você foi atribuído ao projeto "${project.name}".`,
      NotificationType.PROJECT_ASSIGNMENT, // (Verifique seu Enum)
      `/projects/${project.id}` // Link para o projeto
    );
    // --- FIM DA LÓGICA ---

    return savedProjectUser;
  }

  async removeUserFromProject(projectId: string, userId: string): Promise<void> {
    const result = await this.projectUsersRepository.delete({
      project: { id: projectId },
      user: { id: userId },
    });

    if (result.affected === 0) {
      throw new NotFoundException(
        `Utilizador com ID "${userId}" não encontrado no projeto com ID "${projectId}"`,
      );
    }
  }

  async findUsersByProject(projectId: string): Promise<ProjectUser[]> {
    return this.projectUsersRepository.find({
      where: { project: { id: projectId } },
      relations: ['user'],
    });
  }

  async findReportsByProject(projectId: string): Promise<Report[]> {
    return this.reportsRepository.find({
      where: { project: { id: projectId } },
      relations: ['project'],
    });
  }
}