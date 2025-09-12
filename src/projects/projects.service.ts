import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { User } from '../users/entities/user.entity';
import { Organization } from 'src/organization/entities/organization.entity';
import { ProjectUser, ProjectRole } from './entities/project-user.entity';
import { AddUserToProjectDto } from './dto/add-users-to-project.dto';

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
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const { organizationId, ownerId, ...restOfDto } = createProjectDto;

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

    const project = this.projectsRepository.create({
      ...restOfDto,
      organization,
      owner,
      prefix,
    });

    const savedProject = await this.projectsRepository.save(project);

    const projectUser = this.projectUsersRepository.create({
      project: savedProject,
      user: owner,
    });
    await this.projectUsersRepository.save(projectUser);

    return savedProject;
  }

  findAll(): Promise<Project[]> {
    return this.projectsRepository.find({
      relations: ['organization', 'owner'],
    });
  }

  findAllByOrganization(organizationId: string): Promise<Project[]> {
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
      relations: ['organizations'], 
    });

    if (!user) {
      throw new NotFoundException(`Utilizador com ID "${userId}" não encontrado`);
    }
    
    const isUserInOrg = user.organizations.some(org => org.id === project.organization.id);
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

    return this.projectUsersRepository.save(newProjectUser);
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
}