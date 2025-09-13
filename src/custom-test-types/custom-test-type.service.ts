import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomTestType } from './entities/custom-test-type.entity';
import { CreateCustomTestTypeDto } from './dto/create-custom-test-type.dto';
import { UpdateCustomTestTypeDto } from './dto/update-custom-test-type.dto';
import { Project } from 'src/projects/entities/project.entity';

@Injectable()
export class CustomTestTypesService {
  constructor(
    @InjectRepository(CustomTestType)
    private readonly customTestTypeRepository: Repository<CustomTestType>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(projectId: string, createDto: CreateCustomTestTypeDto): Promise<CustomTestType> {
    const project = await this.projectRepository.findOneBy({ id: projectId });
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found`);
    }

    const newType = this.customTestTypeRepository.create({
      ...createDto,
      project,
    });

    try {
      return await this.customTestTypeRepository.save(newType);
    } catch (error) {
      if (error.code === '23505') { // Código de erro para violação de constraint unique
        throw new ConflictException(`A test type with name "${createDto.name}" already exists in this project.`);
      }
      throw error;
    }
  }

  findAllByProject(projectId: string): Promise<CustomTestType[]> {
    return this.customTestTypeRepository.find({
      where: { project: { id: projectId } },
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
    const type = await this.findOne(id);
    try {
      await this.customTestTypeRepository.remove(type);
    } catch (error) {
       // Código de erro para violação de foreign key (definimos 'RESTRICT')
      if (error.code === '23503') {
        throw new ConflictException('Cannot delete this test type because it is currently in use by one or more test cases.');
      }
      throw error;
    }
  }
}