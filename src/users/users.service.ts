import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Organization } from 'src/organization/entities/organization.entity';
import { Project } from 'src/projects/entities/project.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, ...rest } = createUserDto;

    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email already in use.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.usersRepository.create({
      email,
      password: hashedPassword,
      firstAccess: true,
      ...rest,
    });
    return this.usersRepository.save(newUser);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: Partial<CreateUserDto>): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found.');
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async updateFirstAccess(id: string, firstAccess: boolean): Promise<void> {
    await this.usersRepository.update(id, { firstAccess });
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async findUserOrganizations(id: string): Promise<Organization[]> { // Tipagem de retorno ajustada
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['organizationUsers', 'organizationUsers.organization'], // Carrega a relação aninhada
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado`);
    }

    // Mapeia para retornar apenas a lista de organizações
    return user.organizationUsers.map(orgUser => orgUser.organization);
  }

  async findAccessibleProjects(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: {
        id,
        accessGroups: {
          permissions: {
            project: true
          }
        }
      },
      relations: ['accessGroups.permissions.project'], //'organizationUsers', 'organizationUsers.organization', 'organizationUsers.organization.projects'
    });
  
    if (!user) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado`);
    }

    // Mapeia para retornar apenas a lista de projetos acessíveis
    //return user.organizationUsers.flatMap(orgUser => orgUser.organization.projects);
    return user;
  }

  async findUserProjectsInOrganization(userId: string, organizationId: string): Promise<Project[]> {
    return this.projectsRepository.createQueryBuilder('project')
    .innerJoin('project.permission', 'permission')
    .innerJoin('permission.accessGroups', 'accessGroup')
    .innerJoin('accessGroup.users', 'user')
    .where('user.id = :userId', { userId })
    .andWhere('project.organizationId = :organizationId', { organizationId })
    .distinct(true)
    .leftJoinAndSelect('project.owner', 'owner')
    .getMany();
  }
}