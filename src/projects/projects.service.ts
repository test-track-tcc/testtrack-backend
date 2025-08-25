import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const newProject = this.projectsRepository.create(createProjectDto);
    return this.projectsRepository.save(newProject);
  }

  findAll(): Promise<Project[]> {
    return this.projectsRepository.find();
  }

  findOne(id: string): Promise<Project | null> {
    return this.projectsRepository.findOne({ where: { id } });
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const project = await this.projectsRepository.preload({
      id: id,
      ...updateProjectDto,
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found.`);
    }
    return this.projectsRepository.save(project);
  }

  async remove(id: string): Promise<void> {
    const project = await this.findOne(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found.`);
    }
    await this.projectsRepository.remove(project);
  }
}