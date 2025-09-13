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
import { Organization } from 'src/organization/entities/organization.entity';
import { ProjectUser, ProjectRole } from './entities/project-user.entity';
import { AddUserToProjectDto } from './dto/add-users-to-project.dto';
import { Permission } from 'src/permission/entities/permission.entity';

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
    // DataSource para controlar a transação que criei para salvar a permissão quando o projeto é criado. [Lembrar de desfazer se der erro]
    private readonly dataSource: DataSource,
  ) {}




  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    // O uso do dataSource.transaction garante que tudo abaixo seja tudo feito, ou nada feito.
    // O dataSource vai receber um entityManager que será usado dentro da transação.

    const { name, description, organizationId, ownerId } = createProjectDto;
    
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
        permission: savedPermission, 
        prefix: prefix,
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