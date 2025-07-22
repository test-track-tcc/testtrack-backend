import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { Logger } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

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
        users: {
          id: true,
          name: true,
          email: true,
          active: true,
          createdAt: true
        }
      },
      where: { id },
      relations: ['admin', 'users']
    });

    if (!organizationFound) {
      Logger.error(`Organization with ID ${id} not found.`);
      throw new BadRequestException('Organization not found.');
    }

    return organizationFound;
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

  //async findNewAdmin(adminId: string): Promise<User> {
  //  if (adminId) {
  //      Logger.log(`Alterando admin para o usuário de ID ${adminId}`);
  //      const newAdmin = await this.usersService.findOne(adminId);
  //      if (!newAdmin) {
  //        Logger.warn(`Usuário administrador com ID "${adminId}" não encontrado.`);
  //        return null;
  //      }
  //      return newAdmin;
  //  }
  //}

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto): Promise<Organization> {
    // Função que carrega uma organização pelo ID, atualiza seus dados mais simples utilizando o merge,
    // trata separadamente a relação do administrador e salva a entidade atualizada. 
    Logger.log(`Iniciando atualização da organização de ID ${id}`);

    // Separa o adminId.
    const { adminId, ...otherData } = updateOrganizationDto;

    // Usei findOneOrFail para lançar BadRequestException se não encontrar.
    const organization = await this.organizationRepository.findOneOrFail({
      where: { id },
    }).catch(error => {
      Logger.error(`Erro ao carregar organização com ID ${id}: ${error.message}`);
      throw new BadRequestException(`Organização com ID "${id}" não encontrada.`);
    });

    // Alterações simples com merge (junção de duas em uma entidade).
    this.organizationRepository.merge(organization, otherData);

    // Seria interessante separar em uma função diferente essa verificação, mas até então está funcionando.
    if (adminId) {
      Logger.log(`Alterando admin para o usuário de ID ${adminId}`);
      const newAdmin = await this.usersService.findOne(adminId);
      if (!newAdmin) {
        Logger.warn(`Usuário administrador com ID "${adminId}" não encontrado.`);
        throw new BadRequestException('Novo administrador não encontrado.');
      }
      organization.admin = newAdmin;
    } else {
      Logger.warn(`Nenhum novo administrador foi definido.`);
    }
    
    // O .save() compara o objeto 'organization' modificado com o que está no banco e executa os updates necessários, 
    // tanto nas alterações simples quanto na chave estrangeira 'adminId'.
    try {
        const updatedOrganization = await this.organizationRepository.save(organization);
        Logger.log(`Organização com ID ${id} atualizada com sucesso.`);
        return updatedOrganization;
    } catch (error) {
        // Se tiver nome duplicado, o typeorm vai acusar um erro.
        Logger.error(`Erro ao salvar a organização com ID ${id}: ${error.message}`);
        throw new BadRequestException('Erro ao atualizar a organização. Verifique os dados fornecidos.');
    }
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
