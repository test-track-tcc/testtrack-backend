import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Script } from '../test-case/entities/script.entity';

@Injectable()
export class ScriptsService {
  constructor(
    @InjectRepository(Script)
    private scriptRepository: Repository<Script>,
  ) {}

  /**
   * Busca todos os scripts de um PROJETO, ordenados pelos mais recentes.
   */
  async findAllByProject(projectId: string): Promise<Script[]> {
    return this.scriptRepository.find({
      where: {
        testCase: {
          project: {
            id: projectId,
          },
        },
      },
      relations: [
        'testCase',
        'testCase.project',
      ],
      order: {
        createdAt: 'DESC',
      },
    });
  }
}