import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomTestType } from './entities/custom-test-type.entity';
import { CreateCustomTestTypeDto } from './dto/create-custom-test-type.dto';
import { UpdateCustomTestTypeDto } from './dto/update-custom-test-type.dto';
import { Organization } from 'src/organization/entities/organization.entity'; // <-- Import Organization

@Injectable()
export class CustomTestTypesService {
  constructor(
    @InjectRepository(CustomTestType)
    private readonly customTestTypeRepository: Repository<CustomTestType>,
    @InjectRepository(Organization) // <-- Injete o repositório da Organização
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  async create(organizationId: string, createDto: CreateCustomTestTypeDto): Promise<CustomTestType> {
    const organization = await this.organizationRepository.findOneBy({ id: organizationId });
    if (!organization) {
      throw new NotFoundException(`Organization with ID "${organizationId}" not found`);
    }

    const newType = this.customTestTypeRepository.create({
      ...createDto,
      organization,
    });

    try {
      return await this.customTestTypeRepository.save(newType);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(`A test type with name "${createDto.name}" already exists in this organization.`);
      }
      throw error;
    }
  }

  findAllByOrganization(organizationId: string): Promise<CustomTestType[]> {
    return this.customTestTypeRepository.find({
      where: { organization: { id: organizationId } },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<CustomTestType> {
    const type = await this.customTestTypeRepository.findOneBy({ id });
    if (!type) {
      throw new NotFoundException(`Custom Test Type with ID "${id}" not found`);
    }
    return type;
  }

  async update(id: string, updateDto: UpdateCustomTestTypeDto): Promise<CustomTestType> {
    const type = await this.findOne(id);
    this.customTestTypeRepository.merge(type, updateDto);
    return this.customTestTypeRepository.save(type);
  }

  async remove(id: string): Promise<void> {
    const result = await this.customTestTypeRepository.delete(id);
    if (result.affected === 0) {
        throw new NotFoundException(`Custom Test Type with ID "${id}" not found.`);
    }
  }
}