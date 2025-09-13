import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { OrganizationUser, OrganizationRole } from './entities/organization-user.entity'; // Importe a entidade e o enum

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(OrganizationUser) // Injete o novo repositório
    private organizationUserRepository: Repository<OrganizationUser>,
    private usersService: UsersService,
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    const { adminId, ...organizationData } = createOrganizationDto;

    const adminUser = await this.usersService.findOne(adminId);
    if (!adminUser) {
      throw new NotFoundException(`Usuário com ID "${adminId}" não encontrado.`);
    }

    const existingOrg = await this.organizationRepository.findOne({ where: { name: organizationData.name } });
    if (existingOrg) {
      throw new BadRequestException(`Organização com o nome "${organizationData.name}" já existe.`);
    }

    // 1. Crie a organização base
    const newOrganization = this.organizationRepository.create({
      ...organizationData,
      admin: adminUser, // Agora estamos passando um objeto User, não User | null
      users: [adminUser], // Adiciona o admin também como membro da organização
    });

    // 2. Salve a organização para obter um ID
    const savedOrganization = await this.organizationRepository.save(newOrganization);

    // 3. Crie a entrada na tabela de junção para o administrador
    const adminMembership = this.organizationUserRepository.create({
      organization: savedOrganization,
      user: adminUser,
      role: OrganizationRole.ADMIN, // Atribui o cargo de ADMIN
    });
    await this.organizationUserRepository.save(adminMembership);

    return savedOrganization; // Retorna a organização recém-criada
  }

  async validateCreateOrganizationDto(createOrganizationDto: CreateOrganizationDto): Promise<CreateOrganizationDto> {
    if (!createOrganizationDto.name || createOrganizationDto.name.trim() === '') {
      throw new BadRequestException('Organization name is required.');
    }
    const existingOrganization = await this.organizationRepository.findOne({
      where: { name: createOrganizationDto.name },
    });
    Logger.log(`Verificando se o nome da organização já está em uso: ${createOrganizationDto.name}`);
    if (existingOrganization) {
      throw new BadRequestException('Organization name already in use.');
    }
    Logger.log(`Nome da organização é valido: ${createOrganizationDto.name}`);
    if (!createOrganizationDto.adminId || createOrganizationDto.adminId.trim() === '') {
      throw new BadRequestException('Admin ID is required.');
    }
    const validAdmin = await this.usersService.findOne(createOrganizationDto.adminId);
    Logger.log(`Verificando se o ID do administrador é válido: ${createOrganizationDto.adminId}`);
    if (!validAdmin) {
      throw new BadRequestException('Invalid admin ID.');
    }
    Logger.log(`Id de admin é valido: ${createOrganizationDto.adminId}`);
    return createOrganizationDto;
  }

  async findAll() {
    return this.organizationRepository.find({
      select: {
        admin: { id: true, name: true, email: true },
      },
      relations: ['admin'],
    });
  }

  async findAllGroupAccess(orgId: string) {
    // Ajuste para carregar os usuários através da nova relação
    const organization = await this.organizationRepository.findOne({
      where: { id: orgId },
      relations: ['admin', 'organizationUsers', 'organizationUsers.user', 'accessGroups', 'accessGroups.permissions'],
    });
     if (!organization) {
        throw new NotFoundException(`Organização com ID "${orgId}" não encontrada.`);
    }
    return organization;
  }

  async findOne(id: string) {
    const organizationFound = await this.organizationRepository.findOne({
        where: { id },
        relations: ['admin', 'organizationUsers', 'organizationUsers.user'], // Carrega através da entidade de junção
    });

    if (!organizationFound) {
      Logger.error(`Organization with ID ${id} not found.`);
      throw new BadRequestException('Organization not found.');
    }
    
    // Transforma os dados para o formato esperado (opcional, mas mantém a consistência)
    return organizationFound;
  }

  async remove(id: string): Promise<void> {
    const organization = await this.findOne(id);
    await this.organizationRepository.delete(id);
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto): Promise<Organization> {
    Logger.log(`Iniciando atualização da organização de ID ${id}`);
    const { adminId, ...otherData } = updateOrganizationDto;
    const organization = await this.organizationRepository.findOneOrFail({
      where: { id },
    }).catch(error => {
      Logger.error(`Erro ao carregar organização com ID ${id}: ${error.message}`);
      throw new BadRequestException(`Organização com ID "${id}" não encontrada.`);
    });
    this.organizationRepository.merge(organization, otherData);
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
    try {
      const updatedOrganization = await this.organizationRepository.save(organization);
      Logger.log(`Organização com ID ${id} atualizada com sucesso.`);
      return updatedOrganization;
    } catch (error) {
      Logger.error(`Erro ao salvar a organização com ID ${id}: ${error.message}`);
      throw new BadRequestException('Erro ao atualizar a organização. Verifique os dados fornecidos.');
    }
  }

  async findByUserId(userId: string) {
    // Esta consulta precisa ser adaptada para a nova estrutura
    const memberships = await this.organizationUserRepository.find({
        where: { user: { id: userId } },
        relations: ['organization', 'organization.admin']
    });
    return memberships.map(m => m.organization);
  }

  async findUsersByOrganization(organizationId: string): Promise<any[]> {
    const organizationUsers = await this.organizationUserRepository.find({
      where: { organization: { id: organizationId } },
      relations: ['user'],
    });

    return organizationUsers.map(ou => ({
      id: ou.user.id,
      name: ou.user.name,
      email: ou.user.email,
      active: ou.user.active,
      createdAt: ou.user.createdAt,
      role: ou.role, // A informação do cargo agora está aqui!
    }));
  }

  async addUser(userId: string, organizationId: string, role: OrganizationRole = OrganizationRole.MEMBER): Promise<OrganizationUser> {
    const organization = await this.organizationRepository.findOne({ where: { id: organizationId } });
    if (!organization) {
        throw new NotFoundException(`Organização com ID "${organizationId}" não encontrada.`);
    }

    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`Usuário com ID "${userId}" não encontrado.`);
    }

    const existingMembership = await this.organizationUserRepository.findOne({
        where: { user: { id: userId }, organization: { id: organizationId } }
    });

    if (existingMembership) {
        throw new BadRequestException('Este usuário já é membro da organização.');
    }

    const newMembership = this.organizationUserRepository.create({
        organization,
        user,
        role,
    });

    return this.organizationUserRepository.save(newMembership);
  }

  async removeUser(userId: string, organizationId: string): Promise<void> {
    const result = await this.organizationUserRepository.delete({
      user: { id: userId },
      organization: { id: organizationId },
    });

    if (result.affected === 0) {
      throw new NotFoundException(`O usuário com ID "${userId}" não foi encontrado na organização "${organizationId}".`);
    }
  }

  // Novo método para atualizar o cargo
  async updateUserRole(userId: string, organizationId: string, role: OrganizationRole): Promise<OrganizationUser> {
    const organizationUser = await this.organizationUserRepository.findOne({
        where: {
            user: { id: userId },
            organization: { id: organizationId },
        },
    });

    if (!organizationUser) {
        throw new NotFoundException(`O usuário com ID "${userId}" não foi encontrado na organização "${organizationId}".`);
    }

    organizationUser.role = role;
    return this.organizationUserRepository.save(organizationUser);
  }
}