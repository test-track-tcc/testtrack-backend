import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestCase } from './entities/test-case.entity';
import { CreateTestCaseDto } from './dto/create-test-case.dto';
import { UpdateTestCaseStatusDto } from './dto/update-test-case.dto'; // Importe o DTO correto para update
import { StatusCasoTeste } from '../config/enums'; // Certifique-se de que o caminho para enums está correto

@Injectable()
export class TestCasesService {
  constructor(
    @InjectRepository(TestCase)
    private testCasesRepository: Repository<TestCase>,
  ) {}

  async create(createTestCaseDto: CreateTestCaseDto): Promise<TestCase> {
    const newTestCase = this.testCasesRepository.create(createTestCaseDto);
    return this.testCasesRepository.save(newTestCase);
  }

  findAll(): Promise<TestCase[]> {
    return this.testCasesRepository.find();
  }

  async findOne(id: string): Promise<TestCase | null> { // ID agora é string (UUID)
    return this.testCasesRepository.findOne({ where: { id } });
  }

  async update(id: string, updateTestCaseDto: UpdateTestCaseStatusDto): Promise<TestCase> { // ID agora é string (UUID), DTO corrigido
    const testCase = await this.testCasesRepository.findOne({ where: { id } });
    if (!testCase) {
      throw new NotFoundException('Caso de teste não encontrado.');
    }
    // Aplica as propriedades do DTO no objeto da entidade
    Object.assign(testCase, updateTestCaseDto);
    return this.testCasesRepository.save(testCase);
  }

  async remove(id: string): Promise<void> { // ID agora é string (UUID)
    const result = await this.testCasesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Caso de teste não encontrado para exclusão.');
    }
  }

  async updateStatus(id: string, newStatus: StatusCasoTeste): Promise<TestCase> {
    const testCase = await this.testCasesRepository.findOne({ where: { id } });
    if (!testCase) {
      throw new NotFoundException('Caso de teste não encontrado.');
    }
    testCase.status = newStatus;
    return this.testCasesRepository.save(testCase);
  }

  async addComment(id: string, idUsuario: string, comentario: string): Promise<TestCase> {
    const testCase = await this.testCasesRepository.findOne({ where: { id } });
    if (!testCase) {
      throw new NotFoundException('Caso de teste não encontrado.');
    }

    // Inicializa o array de comentários se for nulo
    if (!testCase.comentarios) {
      testCase.comentarios = [];
    }

    testCase.comentarios.push({ idUsuario, comentario, data: new Date() });
    return this.testCasesRepository.save(testCase);
  }

  async attachEvidence(id: string, idAnexo: string): Promise<TestCase> {
    const testCase = await this.testCasesRepository.findOne({ where: { id } });
    if (!testCase) {
      throw new NotFoundException('Caso de teste não encontrado.');
    }

    if (!testCase.anexos) {
      testCase.anexos = [];
    }

    if (!testCase.anexos.includes(idAnexo)) {
      testCase.anexos.push(idAnexo);
    }
    return this.testCasesRepository.save(testCase);
  }

  async registerTimeSpent(id: string, tempo: string): Promise<TestCase> {
    const testCase = await this.testCasesRepository.findOne({ where: { id } });
    if (!testCase) {
      throw new NotFoundException('Caso de teste não encontrado.');
    }
    testCase.tempoGasto = tempo; // Sobrescrevendo o tempo, ajuste se precisar somar
    return this.testCasesRepository.save(testCase);
  }

  async addScript(id: string, scriptContent: string): Promise<TestCase> {
    const testCase = await this.testCasesRepository.findOne({ where: { id } });
    if (!testCase) {
      throw new NotFoundException('Caso de teste não encontrado.');
    }
    if (!testCase.scripts) {
      testCase.scripts = [];
    }
    testCase.scripts.push(scriptContent);
    return this.testCasesRepository.save(testCase);
  }
}