import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bug } from './entities/bug.entity';
import { CreateBugDto } from './dto/create-bug.dto';
import { UsersService } from '../users/users.service';
import { BugStatus } from '../config/enums';
import { UpdateBugStatusDto } from './dto/update-bug.dto';

@Injectable()
export class BugsService {
  constructor(
    @InjectRepository(Bug)
    private bugsRepository: Repository<Bug>,
    private readonly usersService: UsersService,
  ) {}

  async create(createBugDto: CreateBugDto): Promise<Bug> {
    const newBug = this.bugsRepository.create({
      ...createBugDto,
      status: BugStatus.OPEN,
    });
    return this.bugsRepository.save(newBug);
  }

  findAll(): Promise<Bug[]> {
    return this.bugsRepository.find({
      relations: ['testCase', 'assignedDeveloper', 'testCase.project'],
    });
  }

  async findOne(id: string): Promise<Bug> {
    const bug = await this.bugsRepository.findOne({
      where: { id },
      relations: ['testCase', 'assignedDeveloper'],
    });
    if (!bug) {
      throw new NotFoundException(`Bug with ID ${id} not found.`);
    }
    return bug;
  }

  async updateStatus(id: string, updateBugStatusDto: UpdateBugStatusDto): Promise<Bug> {
    const bug = await this.findOne(id); // Reutiliza o findOne que já trata NotFoundException

    bug.status = updateBugStatusDto.status;
    return this.bugsRepository.save(bug);
  }

  async assignDeveloper(
    bugId: string,
    developerId: string,
  ): Promise<Bug> {
    const bug = await this.findOne(bugId);

    const developer = await this.usersService.findOne(developerId);
    if (!developer) {
      throw new NotFoundException(
        `Developer with ID ${developerId} not found.`,
      );
    }

    bug.assignedDeveloperId = developerId;
    bug.assignedDeveloper = developer;
    
    if (bug.status === BugStatus.OPEN || bug.status === BugStatus.REOPENED) {
      bug.status = BugStatus.IN_PROGRESS;
    }

    return this.bugsRepository.save(bug);
  }

  async remove(id: string): Promise<void> {
    const result = await this.bugsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Bug with ID ${id} not found.`);
    }
  }
}