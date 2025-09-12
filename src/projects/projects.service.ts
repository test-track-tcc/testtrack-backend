import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { User } from '../users/entities/user.entity';
import { Organization } from 'src/organization/entities/organization.entity';
import { ProjectUser, ProjectRole } from './entities/project-user.entity';
import { AddUserToProjectDto } from './dto/add-users-to-project.dto';
import { Permission } from 'src/permission/entities/permission.entity';

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
    // DataSource para controlar a transação que criei para salvar a permissão quando o projeto é criado. [Lembrar de desfazer se der erro]
    private readonly dataSource: DataSource,
  ) {}




  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    // O uso do dataSource.transaction garante que tudo abaixo seja tudo feito, ou nada feito.
    // O dataSource vai receber um entityManager que será usado dentro da transação.

    const { name, description, organizationId, ownerId } = createProjectDto;

    const organization = await this.organizationsRepository.findOne({ where: { id: organizationId } });
    if (!organization) {
      throw new NotFoundException(`Organization with ID "${organizationId}" not found`);
    }

    const owner = await this.usersRepository.findOne({ where: { id: ownerId } });
    if (!owner) {
      throw new NotFoundException(`User with ID "${ownerId}" not found`);
    }


    
    return this.dataSource.transaction(async (entityManager) => {
      // Como o projeto depende da permissão, a permissão deve ser criada antes e com base 
      // nas informações passadas pelo usuário criador do projeto.
      const permissionName = `Acesso - Projeto ${name}`;
      const newPermission = entityManager.create(Permission, {
        name: permissionName,
        description: `Permissão de acesso para o projeto ${name}.`,
        createdBy: owner,
      });
      const savedPermission = await entityManager.save(newPermission);

      // Após criar e salvar a nova permissão, deve ser criado o projeto associado.
      const newProject = entityManager.create(Project, {
        name: name,
        description: description,
        organization: organization,
        owner: owner,
        permission: savedPermission, // Link da permissão criada no projeto
      });

      const savedProject = await entityManager.save(newProject);

      // Atualizando a permissão com o projeto por se tratar de OneToOne bidirecional
      // (embora o cascade muitas vezes cuide disso)
      savedPermission.project = savedProject;
      await entityManager.save(savedPermission);
      
      // Dono como ADMIN do projeto.
      const projectUser = entityManager.create(ProjectUser, {
        project: savedProject,
        user: owner,
        role: ProjectRole.ADMIN,
      });

      const savedProjectUser = await entityManager.save(projectUser);

      // Se não houve erros, a transação fará COMMIT.
      // Se qualquer 'save' falhar, a transação fará o ROLLBACK.
      return savedProject;
    });
  }


// Mantive o seu no código porque pode ser útil para comparar depois e garantir que o meu não dá erros.


//  async createDoDiogo(createProjectDto: CreateProjectDto): Promise<Project> {
//    const { name, description, organizationId, ownerId } = createProjectDto;
//
//    const organization = await this.organizationsRepository.findOne({ where: { id: organizationId } });
//    if (!organization) {
//      throw new NotFoundException(`Organization with ID "${organizationId}" not found`);
//    }
//
//    const owner = await this.usersRepository.findOne({ where: { id: ownerId } });
//    if (!owner) {
//      throw new NotFoundException(`User with ID "${ownerId}" not found`);
//    }
//
//    const project = this.projectsRepository.create({
//      name,
//      description,
//      organization,
//      owner,
//    });
//
//    const savedProject = await this.projectsRepository.save(project);
//
//    const projectUser = this.projectUsersRepository.create({
//      project: savedProject,
//      user: owner,
//      role: ProjectRole.ADMIN,
//    });
//    await this.projectUsersRepository.save(projectUser);
//
//    return savedProject;
//  }

  findAll(): Promise<Project[]> {
    return this.projectsRepository.find({ relations: ['organization', 'owner'] });
  }

  findAllByOrganization(organizationId: string): Promise<Project[]> {
    return this.projectsRepository.find({
      where: {
        organization: {
          id: organizationId,
        },
      },
    });
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({ where: { id }, relations: ['organization', 'owner'] });
    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const project = await this.findOne(id);

    const { name, description, organizationId, ownerId } = updateProjectDto;

    if (name) project.name = name;
    if (description) project.description = description;

    if (organizationId) {
      const organization = await this.organizationsRepository.findOne({ where: { id: organizationId } });
      if (!organization) {
        throw new NotFoundException(`Organization with ID "${organizationId}" not found`);
      }
      project.organization = organization;
    }

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

  async addUserToProject(
    projectId: string,
    addUserToProjectDto: AddUserToProjectDto,
  ): Promise<ProjectUser> {
    const { userId, role } = addUserToProjectDto;

    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
      relations: ['organization'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found`);
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['organizations'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    if (!user.active) {
      throw new BadRequestException(`User with ID "${userId}" is not active.`);
    }

    if (
      !user.organizations ||
      !user.organizations.some(org => org.id === project.organization.id)
    ) {
      throw new BadRequestException(
        `User with ID "${userId}" does not belong to the same organization as the project.`,
      );
    } 

    const existingProjectUser = await this.projectUsersRepository.findOne({
        where: {
            project: { id: projectId },
            user: { id: userId }
        }
    });

    if (existingProjectUser) {
        throw new BadRequestException(`User with ID "${userId}" is already in the project.`);
    }

    const newProjectUser = this.projectUsersRepository.create({
      project,
      user,
      role,
    });

    return this.projectUsersRepository.save(newProjectUser);
  }
}