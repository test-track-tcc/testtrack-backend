import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { ProjectsService } from 'src/projects/projects.service';
import { Logger } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    private usersService: UsersService,
    private projectsService: ProjectsService,
  ) {}

  async findAll() {

    return this.permissionRepository.find({
      select: {
        id: true,
        name: true,
        description: true,
        createdBy: {
          id: true,
          name: true,
          email: true,
        },
      },
      relations: ['createdBy'],
    });
  }

  async findAllByOrg(orgId: string): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: {
        project: {
          organization: {
            id: orgId,
          },
        },
      },
      relations: ['createdBy'],
    });
  }
  
  async findOne(id: string) {
    const permission = await this.permissionRepository.findOne({
      select: {
        id: true,
        name: true,
        description: true,
        createdBy: {
          id: true,
          name: true,
          email: true,
        },
      },
      where: { id },
      relations: ['createdBy'],
    });
    if (!permission) throw new NotFoundException('Permissão não encontrada');
    return permission;
  }

  async create(createDto: CreatePermissionDto): Promise<Permission> {
    const { createdById, projectId, ...permissionData } = createDto;

    const user = await this.usersService.findOne(createdById);
    if (!user) {
      throw new BadRequestException(`Usuário com ID "${createdById}" não encontrado.`);
    }

    const project = await this.projectsService.findOne(projectId);
    if (!project) {
      throw new BadRequestException(`Projeto com ID "${projectId}" não encontrado.`);
    }
    
    const permission = this.permissionRepository.create({
      ...permissionData,
      createdBy: user,
      project: project,
    });

    try {
        return await this.permissionRepository.save(permission);
    } catch (error) {
        if (error.code === '23505') {
            throw new BadRequestException(`Já existe uma permissão com o nome "${permission.name}".`);
        }
        throw new BadRequestException('Erro ao salvar a permissão.');
    }
  }

  async remove(id: string): Promise<void> {
    const permission = await this.findOne(id);
    // [ATENÇÃO] só será utilizado se a permissão existir e enquanto a deleção por cascade estiver desabilitado!.

    // Utilizei o método findOne para garantir que a permissão existe antes de tentar removê-la,
    // se não existir, uma exceção será lançada na própria função findOne.

    await this.permissionRepository.delete(id);
  }

  async update(id: string, updateDto: UpdatePermissionDto) {
    const permission = await this.findOne(id);
    if (!permission) throw new NotFoundException('Permissão não encontrada');

      // Atualiza os campos somente quando o DTO fornecer valores
    if (updateDto.name !== undefined) {
      permission.name = updateDto.name;
    }

    if (updateDto.description !== undefined) {
      permission.description = updateDto.description;
    }

    return this.permissionRepository.save(permission);
  }
}