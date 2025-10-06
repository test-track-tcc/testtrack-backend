import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AccessGroup } from './entities/access-group.entity';
import { Organization } from '../organization/entities/organization.entity';
import { Permission } from '../permission/entities/permission.entity';
import { CreateAccessGroupDto } from './dto/create-access-group.dto';
import { UpdateAccessGroupDto } from './dto/update-access-group.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AccessGroupService {
  constructor(
    @InjectRepository(AccessGroup)
    private groupsRepo: Repository<AccessGroup>,

    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,

    @InjectRepository(Permission)
    private permRepo: Repository<Permission>,

    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  // Retorna todos os grupos de acesso (de todas organizações).
  async findAll(): Promise<AccessGroup[]> {
    return this.groupsRepo.find({
      relations: ['permissions', 'organization'],
      order: { name: 'ASC' },
    });
  }

 // Retorna todos os grupos de uma organização específica.
  async findAllInOrg(orgId: string): Promise<AccessGroup[]> {
    const exists = await this.orgRepo.exist({ where: { id: orgId } });
    if (!exists) {
      throw new NotFoundException(`Organização com id "${orgId}" não encontrada.`);
    }

    return this.groupsRepo.find({
      where: { organization: { id: orgId } },
      relations: ['permissions', 'organization'],
      order: { name: 'ASC' },
    });
  }

  // Busca um grupo pelo id, carregando organization e permissions.
  async findOne(id: string): Promise<AccessGroup> {
    const group = await this.groupsRepo.findOne({
      where: { id },
      relations: ['permissions', 'organization', 'users'],
    });

    if (!group) {
      throw new NotFoundException(`Grupo de acesso com id "${id}" não encontrado.`);
    }

    return group;
  }

  // Cria um novo grupo de acesso.
  async create(dto: CreateAccessGroupDto): Promise<AccessGroup> {
    const { organizationId, name, description, permissionIds } = dto;

    // 1. Valida a organização
    const organization = await this.orgRepo.findOne({ where: { id: organizationId } });
    if (!organization) {
      throw new BadRequestException(`Organização com id "${organizationId}" não encontrada.`);
    }

    const duplicate = await this.groupsRepo.findOne({
      where: { name, organization: { id: organizationId } },
    });
    if (duplicate) {
      throw new BadRequestException('Já existe um grupo com esse nome nesta organização.');
    }

    let permissions: Permission[] = [];
    if (permissionIds && permissionIds.length > 0) {
      permissions = await this.permRepo.find({ where: { id: In(permissionIds) } });
      if (permissions.length !== permissionIds.length) {
        throw new BadRequestException('Uma ou mais permissões informadas não foram encontradas.');
      }
    }

    const group = this.groupsRepo.create({
      name,
      description,
      organization,
      permissions,
    });

    try {
      return await this.groupsRepo.save(group);
    } catch (error) {
      throw new BadRequestException('Erro ao criar grupo de acesso. Verifique os dados.');
    }
  }

  // Atualiza um grupo.
  async update(id: string, updateAccessGroupDto: UpdateAccessGroupDto): Promise<AccessGroup> {
    const group = await this.groupsRepo.findOne({
      where: { id },
      relations: ['permissions', 'organization'],
    });

    if (!group) {
      throw new NotFoundException(`Grupo de acesso com id "${id}" não encontrado.`);
    }

    // Atualiza campos simples
    this.groupsRepo.merge(group, {
      name: updateAccessGroupDto.name,
      description: updateAccessGroupDto.description,
    });

    // Se vier permissionIds, valida e substitui
    if (updateAccessGroupDto.permissionIds) {
      const permissions = await this.permRepo.find({ where: { id: In(updateAccessGroupDto.permissionIds) } });
      if (permissions.length !== updateAccessGroupDto.permissionIds.length) {
        throw new BadRequestException('Algumas permissões informadas não foram encontradas.');
      }
      group.permissions = permissions;
    }

    try {
      return await this.groupsRepo.save(group);
    } catch (error) {
      throw new BadRequestException('Erro ao atualizar o grupo de acesso. Verifique os dados.');
    }
  }

  /**
   * Remove um grupo de acesso (valida existência antes).
   */
  async remove(id: string): Promise<void> {
    const group = await this.groupsRepo.findOne({ where: { id } });
    if (!group) {
      throw new NotFoundException(`Grupo de acesso com id "${id}" não encontrado.`);
    }

    try {
      await this.groupsRepo.delete(id);
    } catch (error) {
      throw new BadRequestException('Erro ao deletar o grupo de acesso.');
    }
  }

  async addUser(groupId: string, userId: string): Promise<AccessGroup> {
    // Busca o grupo de acesso e carrega a relação 'users'
    const accessGroup = await this.groupsRepo.findOne({
      where: { id: groupId },
      relations: ['users'],
    });

    if (!accessGroup) {
      throw new NotFoundException(`Grupo de acesso com id "${groupId}" não encontrado.`);
    }

    const user = await this.usersRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`Usuário com id "${userId}" não encontrado.`);
    }
    
    // Verifica se o usuário já está no grupo para evitar duplicatas
    const userAlreadyInGroup = accessGroup.users.some(u => u.id === user.id);
    if (userAlreadyInGroup) {
      // Retorna o grupo como está
      return accessGroup;
    }

    accessGroup.users.push(user);
    return this.groupsRepo.save(accessGroup);
  }

  async removeUser(groupId: string, userId: string): Promise<AccessGroup> {
    const group = await this.groupsRepo.findOne({
      where: { id: groupId },
      relations: ['users'],
    });

    if (!group) {
      throw new NotFoundException(`Grupo de acesso com id "${groupId}" não encontrado.`);
    }

    const userIndex = group.users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      throw new NotFoundException(`O usuário com ID "${userId}" não foi encontrado no grupo "${group.name}".`);
    }

    group.users = group.users.filter(user => user.id !== userId); // encontra o usuário e remove do array

    return await this.groupsRepo.save(group);
  }
}