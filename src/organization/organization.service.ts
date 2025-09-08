import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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


      //const existingOrganization = await this.organizationRepository.findOne({ where: { name: createOrganizationDto.name } });
    //const validAdmin = await this.usersService.findOne(createOrganizationDto.adminId);
    //Logger.log(`Validando administrador com ID: ${createOrganizationDto.adminId}`);
    
    //if (existingOrganization) {
    //  throw new BadRequestException('Name already in use.');
    //}

  // async create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
  //   // Antes de criar uma nova organização, verificamos se o nome já está em uso e se o administrador é válido
  //   // a partir do input do usuário e o inserindo como parâmetro na função validateCreateOrganizationDto.

  //   try {
  //     Logger.log(`Criando organização com nome: ${createOrganizationDto.name}`);
  //     const validatedDto = await this.validateCreateOrganizationDto(createOrganizationDto);
  //     Logger.log(`Validação concluída para a organização: ${validatedDto.name}`);
  //     const newOrganization = this.organizationRepository.create({
  //       ...validatedDto, // Copia os outros campos armazenados no DTO além de adminId.
  //       admin: await this.usersService.findOne(validatedDto.adminId), // Associa o objeto User completo.
  //     });
  //     return this.organizationRepository.save(newOrganization);

  //   } catch (error) {
  //     Logger.error(`[ERRO]: ${error.message}`);
  //     throw error;
  //   }
    
  // }

  async create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    const { adminId, ...organizationData } = createOrganizationDto;

    // 1. Buscamos o usuário que será o administrador.
    const adminUser = await this.usersService.findOne(adminId);

    // 2. Verificação crucial: Se o usuário não for encontrado, lançamos um erro.
    // Isso resolve o problema de atribuir 'null' à propriedade 'admin'.
    if (!adminUser) {
      throw new NotFoundException(`Usuário com ID "${adminId}" não encontrado. Não é possível criar a organização.`);
    }
    
    // Boa prática: Verificar se já existe uma organização com o mesmo nome
    const existingOrg = await this.organizationRepository.findOne({where: { name: organizationData.name }});
    if (existingOrg) {
        throw new BadRequestException(`Organização com o nome "${organizationData.name}" já existe.`);
    }

    // 3. Criamos a instância da organização com os dados e o objeto 'admin' completo.
    const newOrganization = this.organizationRepository.create({
      ...organizationData,
      admin: adminUser, // Agora estamos passando um objeto User, não User | null
    });

    // 4. Salvamos a nova organização. O tipo de retorno agora está correto.
    return this.organizationRepository.save(newOrganization);
  }

  async validateCreateOrganizationDto(createOrganizationDto: CreateOrganizationDto): Promise<CreateOrganizationDto> {
    // Verifica se o nome da organização é válido e não está vazio.
    // [VÁLIDO] Será válido se e somente se o nome não for vazio ou nulo.
    if (!createOrganizationDto.name || createOrganizationDto.name.trim() === '') {
      throw new BadRequestException('Organization name is required.');
    }

    const existingOrganization = await this.organizationRepository.findOne({
      where: { name: createOrganizationDto.name }
    });

    Logger.log(`Verificando se o nome da organização já está em uso: ${createOrganizationDto.name}`);

    // Verifica se o nome da organização já está em uso.
    // [VÁLIDO] Será válido se e somente se o nome não estiver em uso.
    if (existingOrganization) {
      throw new BadRequestException('Organization name already in use.');
    }

    Logger.log(`Nome da organização é valido: ${createOrganizationDto.name}`);

    // Verifica se o id do admin é válido e não está vazio.
    // [VÁLIDO] Será válido se e somente se o id não for vazio ou nulo.
    if (!createOrganizationDto.adminId || createOrganizationDto.adminId.trim() === '') {
      throw new BadRequestException('Admin ID is required.');
    }
    
    const validAdmin = await this.usersService.findOne(createOrganizationDto.adminId);
    Logger.log(`Verificando se o ID do administrador é válido: ${createOrganizationDto.adminId}`);
    // Verifica se o administrador existe.
    // [VÁLIDO] Será válido se e somente se o administrador existir.
    if (!validAdmin) {
      throw new BadRequestException('Invalid admin ID.');
    }

    Logger.log(`Id de admin é valido: ${createOrganizationDto.adminId}`);
    return createOrganizationDto;
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

  async findByUserId(userId: string) {
    return this.organizationRepository.find({
      where: { users: { id: userId } },
      relations: ['admin'],
    });
  }

  async findUsersByOrganization(organizationId: string): Promise<User[]> {
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
      relations: ['users'],
    });

    if (!organization) {
      throw new NotFoundException(`Organização com ID "${organizationId}" não encontrada.`);
    }
    return organization.users.map(({ password, ...user }) => user) as User[];
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

  async removeUser(userId: string, organizationId: string) {
    const organization = await this.findOne(organizationId);
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    organization.users = organization.users.filter(u => u.id !== userId);
    await this.organizationRepository.save(organization);
  }
}
