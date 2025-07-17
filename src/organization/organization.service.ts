import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    private usersService: UsersService
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    const newOrganization = this.organizationRepository.create(createOrganizationDto);
    const existingOrganization = await this.organizationRepository.findOne({ where: { name: newOrganization.name } });

    if (existingOrganization) {
      throw new BadRequestException('Name already in use.');
    }

    return this.organizationRepository.save(newOrganization);
  }

  async findAll() {
    // Retorna uma lista de organizações e o nome, email e id do admin associado.
    return this.organizationRepository.find({
      select: {
        admin: {
          id: true,
          name: true,
          email: true,
        },
      },
      relations: ['admin'],
    });
}

  async findOne(id: string) {
    let organizationFound = await this.organizationRepository.findOne({
      select: {
        admin: {
          id: true,
          name: true,
          email: true,
        },
      },
      where: { id },
      relations: ['admin', 'users']
    });

    if (!organizationFound) {
      throw new BadRequestException('Organization not found.');
    }

    return organizationFound;
  }

  update(id: string, updateOrganizationDto: UpdateOrganizationDto) {
    return `This action updates a #${id} organization`;
  }

  async remove(id: string): Promise<void> {
    const organization = await this.findOne(id);
    // Utilizei o método findOne para garantir que a organização existe antes de tentar removê-la,
    // se não existir, uma exceção será lançada na própria função findOne.

    // Verifica se a organização tem usuários associados antes de remover.
    //if (organization.users && organization.users.length > 0) {
    //  throw new BadRequestException('Organization has associated users and cannot be deleted.');
    //}
    
    await this.organizationRepository.delete(id);
  }

  async findByUserId(userId: string) { // NÃO TERMINEI!
    return this.organizationRepository.find({
      where: { users: { id: userId } },
      relations: ['admin'],
    });
  }

  async addUser(userId: string, organizationId: string) {
    const organization = await this.findOne(organizationId);
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    organization.users.push(user);
    await this.organizationRepository.save(organization);
  }
}
