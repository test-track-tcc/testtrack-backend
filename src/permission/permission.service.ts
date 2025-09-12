import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { Logger } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    private usersService: UsersService
  ) {}

  async findAll() {
    // Retorna uma lista de permissões e o nome, email e id do admin associado.
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

  async create(createDto: CreatePermissionDto) {
    let currentUserId = createDto.createdById;
    const user = await this.usersService.findOne(currentUserId);

    if (!user) throw new BadRequestException('Usuário não encontrado');

    const permission = this.permissionRepository.create({
      name: createDto.name,
      description: createDto.description,
      createdBy: user,
    });

    return this.permissionRepository.save(permission);
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