import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AccessGroup } from './entities/access-group.entity';
import { Organization } from '../organization/entities/organization.entity';
import { Permission } from '../permission/entities/permission.entity';
import { CreateAccessGroupDto } from './dto/create-access-group.dto';
import { UpdateAccessGroupDto } from './dto/update-access-group.dto';

@Injectable()
export class AccessGroupsService {
  constructor(
    @InjectRepository(AccessGroup)
    private groupsRepo: Repository<AccessGroup>,

    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,

    @InjectRepository(Permission)
    private permRepo: Repository<Permission>,
  ) {}

  // Retorna todos os grupos de acesso (de todas organizações).
  async findAll(): Promise<AccessGroup[]> {
    return this.groupsRepo.find({
      relations: ['organization'],
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
  async find(id: string): Promise<AccessGroup> {
    const group = await this.groupsRepo.findOne({
      where: { id },
      relations: ['permissions', 'organization'],
    });

    if (!group) {
      throw new NotFoundException(`Grupo de acesso com id "${id}" não encontrado.`);
    }

    return group;
  }

  // Cria um novo grupo de acesso.
  async create(dto: CreateAccessGroupDto): Promise<AccessGroup> {
    // Valida organização
    const org = await this.orgRepo.findOne({ where: { id: dto.organizationId } });
    if (!org) {
      throw new BadRequestException(`Organização com id "${dto.organizationId}" não encontrada.`);
    }

    // Checa existência de grupo com mesmo nome
    const duplicate = await this.groupsRepo.findOne({
      where: { name: dto.name, organization: { id: dto.organizationId } },
    });
    if (duplicate) {
      throw new BadRequestException('Já existe um grupo com esse nome nesta organização.');
    }

    const group = this.groupsRepo.create({
      name: dto.name,
      description: dto.description,
      organization: org
    });

    try {
      return await this.groupsRepo.save(group);
    } catch (error) {
      throw new BadRequestException('Erro ao criar grupo de acesso. Verifique os dados.');
    }
  }

  // Atualiza um grupo.
  async update(id: string, dto: UpdateAccessGroupDto): Promise<AccessGroup> {
    const group = await this.groupsRepo.findOne({
      where: { id },
      relations: ['permissions', 'organization'],
    });

    if (!group) {
      throw new NotFoundException(`Grupo de acesso com id "${id}" não encontrado.`);
    }

    // Atualiza campos simples
    this.groupsRepo.merge(group, {
      name: dto.name,
      description: dto.description,
    });

    // Se vier permissionIds, valida e substitui
    if (dto.permissionIds) {
      const permissions = await this.permRepo.find({ where: { id: In(dto.permissionIds) } });
      if (permissions.length !== dto.permissionIds.length) {
        throw new BadRequestException('Algumas permissões informadas não foram encontradas.');
      }
      group.permissions = permissions;
    }

    // Se trocar a organização (raro), valida nova org
    if (dto.organizationId && dto.organizationId !== group.organization?.id) {
      const newOrg = await this.orgRepo.findOne({ where: { id: dto.organizationId } });
      if (!newOrg) {
        throw new BadRequestException(`Nova organização com id "${dto.organizationId}" não encontrada.`);
      }
      group.organization = newOrg;
    }

    try {
      return await this.groupsRepo.save(group);
    } catch (error) {
      this.logger.error(`Erro ao atualizar grupo ${id}: ${error.message}`, error);
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
      this.logger.error(`Erro ao deletar grupo ${id}: ${error.message}`, error);
      throw new BadRequestException('Erro ao deletar o grupo de acesso.');
    }
  }
}