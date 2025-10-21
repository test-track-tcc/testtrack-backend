import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AccessGroup } from './entities/access-group.entity';
import { Organization } from '../organization/entities/organization.entity';
import { Permission } from '../permission/entities/permission.entity';
import { CreateAccessGroupDto } from './dto/create-access-group.dto';
import { UpdateAccessGroupDto } from './dto/update-access-group.dto';

@Injectable()
export class AccessGroupService {
  constructor(
    @InjectRepository(AccessGroup)
    private groupsRepo: Repository<AccessGroup>,

    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,

    @InjectRepository(Permission)
    private permRepo: Repository<Permission>,
  ) {}

  async findAll(): Promise<AccessGroup[]> {
    return this.groupsRepo.find({
      relations: ['permissions', 'organization'],
      order: { name: 'ASC' },
    });
  }

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

  async findOne(id: string): Promise<AccessGroup> {
    const group = await this.groupsRepo.findOne({
      where: { id },
      relations: ['permissions', 'organization'],
    });

    if (!group) {
      throw new NotFoundException(`Grupo de acesso com id "${id}" não encontrado.`);
    }

    return group;
  }

  async create(dto: CreateAccessGroupDto): Promise<AccessGroup> {
    const { organizationId, name, description, permissionIds } = dto;

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

  async update(id: string, updateAccessGroupDto: UpdateAccessGroupDto): Promise<AccessGroup> {
    const group = await this.groupsRepo.findOne({
      where: { id },
      relations: ['permissions', 'organization'],
    });

    if (!group) {
      throw new NotFoundException(`Grupo de acesso com id "${id}" não encontrado.`);
    }

    this.groupsRepo.merge(group, {
      name: updateAccessGroupDto.name,
      description: updateAccessGroupDto.description,
    });

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
}