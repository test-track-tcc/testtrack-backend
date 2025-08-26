import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { User } from '../users/entities/user.entity';
import { Organization } from 'src/organization/entities/organization.entity';
import { ProjectUser, ProjectRole } from './entities/project-user.entity';

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
    const { name, description, organizationId, ownerId } = createProjectDto;

    const organization = await this.organizationsRepository.findOne({ where: { id: organizationId } });
    if (!organization) {
      throw new NotFoundException(`Organization with ID "${organizationId}" not found`);
    }

    const owner = await this.usersRepository.findOne({ where: { id: ownerId } });
    if (!owner) {
      throw new NotFoundException(`User with ID "${ownerId}" not found`);
    }

    const project = this.projectsRepository.create({
      name,
      description,
      organization, // Atribui o objeto Organization
      owner,        // Atribui o objeto User
    });

    const savedProject = await this.projectsRepository.save(project);

    const projectUser = this.projectUsersRepository.create({
      project: savedProject,
      user: owner,
      role: ProjectRole.ADMIN,
    });
    await this.projectUsersRepository.save(projectUser);

    return savedProject;
  }

  findAll(): Promise<Project[]> {
    return this.projectsRepository.find({ relations: ['organization', 'owner'] });
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({ where: { id }, relations: ['organization', 'owner'] });
    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    // Busca o projeto existente para garantir que ele exista
    const project = await this.findOne(id);

    // Desestrutura o DTO para tratar as propriedades de texto e as relações separadamente
    const { name, description, organizationId, ownerId } = updateProjectDto;

    if (name) project.name = name;
    if (description) project.description = description;

    // Se um novo organizationId foi fornecido, busca e atualiza a relação
    if (organizationId) {
      const organization = await this.organizationsRepository.findOne({ where: { id: organizationId } });
      if (!organization) {
        throw new NotFoundException(`Organization with ID "${organizationId}" not found`);
      }
      project.organization = organization;
    }

    // Se um novo ownerId foi fornecido, busca e atualiza a relação
    if (ownerId) {
      const owner = await this.usersRepository.findOne({ where: { id: ownerId } });
      if (!owner) {
        throw new NotFoundException(`User with ID "${ownerId}" not found`);
      }
      project.owner = owner;
    }

    return this.projectsRepository.save(project);
  }

  async remove(id: string): Promise<void> {
    const result = await this.projectsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }
  }

  async addUserToProject(projectId: string, userId: string, role: ProjectRole): Promise<ProjectUser> {
    const project = await this.findOne(projectId);
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    const newProjectUser = this.projectUsersRepository.create({
      project,
      user,
      role,
    });

    return this.projectUsersRepository.save(newProjectUser);
  }
}