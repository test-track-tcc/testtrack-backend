import { Controller, Get, Post, Body, Param, Put, Patch, Delete, HttpCode, NotFoundException, BadRequestException } from '@nestjs/common';
import { TestCasesService } from './test-case.service';
import { CreateTestCaseDto } from './dto/create-test-case.dto';
import { UpdateTestCaseStatusDto } from './dto/update-test-case.dto';
import { TestCase } from './entities/test-case.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { StatusCasoTeste } from '../config/enums';

@ApiTags('test-cases')
@Controller('test-cases')
export class TestCasesController {
  constructor(private readonly testCasesService: TestCasesService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo caso de teste' })
  @ApiResponse({ status: 201, description: 'Caso de teste criado com sucesso', type: TestCase })
  @ApiResponse({ status: 400, description: 'Requisição inválida' })
  @ApiBody({ type: CreateTestCaseDto, description: 'Dados para a criação de um novo caso de teste.' })
  async create(@Body() createTestCaseDto: CreateTestCaseDto): Promise<TestCase> {
    return this.testCasesService.create(createTestCaseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retorna todos os casos de teste' })
  @ApiResponse({ status: 200, description: 'Lista de casos de teste retornada com sucesso', type: [TestCase] })
  async findAll(): Promise<TestCase[]> {
    return this.testCasesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um caso de teste pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do caso de teste (UUID)', type: 'string', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @ApiResponse({ status: 200, description: 'Caso de teste encontrado', type: TestCase })
  @ApiResponse({ status: 404, description: 'Caso de teste não encontrado' })
  async findOne(@Param('id') id: string): Promise<TestCase> {
    const testCase = await this.testCasesService.findOne(id);
    if (!testCase) {
      throw new NotFoundException('Caso de teste não encontrado.');
    }
    return testCase;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um caso de teste existente' })
  @ApiParam({ name: 'id', description: 'ID do caso de teste (UUID)', type: 'string' })
  @ApiResponse({ status: 200, description: 'Caso de teste atualizado com sucesso', type: TestCase })
  @ApiResponse({ status: 400, description: 'Dados da requisição inválidos' })
  @ApiResponse({ status: 404, description: 'Caso de teste não encontrado' })
  @ApiBody({ type: UpdateTestCaseStatusDto, description: 'Dados para atualização do caso de teste (parciais ou completos).' })
  async update(@Param('id') id: string, @Body() updateTestCaseDto: UpdateTestCaseStatusDto): Promise<TestCase> {
    const updatedTestCase = await this.testCasesService.update(id, updateTestCaseDto);
    return updatedTestCase;
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove um caso de teste' })
  @ApiParam({ name: 'id', description: 'ID do caso de teste (UUID)', type: 'string' })
  @ApiResponse({ status: 204, description: 'Caso de teste removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Caso de teste não encontrado para remoção' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.testCasesService.remove(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualiza o status de um caso de teste' })
  @ApiParam({ name: 'id', description: 'ID do caso de teste (UUID)', type: 'string' })
  @ApiBody({ type: UpdateTestCaseStatusDto, description: 'Novo status para o caso de teste e opcionalmente um comentário.' })
  @ApiResponse({ status: 200, description: 'Status do caso de teste atualizado com sucesso', type: TestCase })
  @ApiResponse({ status: 404, description: 'Caso de teste não encontrado' })
  async updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateTestCaseStatusDto): Promise<TestCase> {
    const updatedTestCase = await this.testCasesService.updateStatus(id, updateStatusDto.newStatus);
    if (updateStatusDto.comment) {
      await this.testCasesService.addComment(id, 'id_usuario_da_sessao', updateStatusDto.comment);
    }
    return updatedTestCase;
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Adiciona um comentário a um caso de teste' })
  @ApiParam({ name: 'id', description: 'ID do caso de teste (UUID)', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idUsuario: { type: 'string', format: 'uuid', example: 'f0e9d8c7-b6a5-4321-fedc-ba9876543210' },
        comentario: { type: 'string', example: 'Este caso de teste precisa de revisão.' },
      },
      required: ['idUsuario', 'comentario'],
    },
    description: 'Dados para adicionar um comentário.'
  })
  @ApiResponse({ status: 200, description: 'Comentário adicionado com sucesso', type: TestCase })
  @ApiResponse({ status: 404, description: 'Caso de teste não encontrado' })
  async addComment(
    @Param('id') id: string,
    @Body('idUsuario') idUsuario: string,
    @Body('comentario') comentario: string,
  ): Promise<TestCase> {
    if (!idUsuario || !comentario) {
      throw new BadRequestException('ID do usuário e comentário são obrigatórios.');
    }
    return this.testCasesService.addComment(id, idUsuario, comentario);
  }

  @Post(':id/attachments')
  @ApiOperation({ summary: 'Anexa uma evidência a um caso de teste' })
  @ApiParam({ name: 'id', description: 'ID do caso de teste (UUID)', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idAnexo: { type: 'string', example: 'url_da_evidencia_ou_id_do_arquivo' },
      },
      required: ['idAnexo'],
    },
    description: 'Dados para anexar uma evidência (URL ou ID).'
  })
  @ApiResponse({ status: 200, description: 'Evidência anexada com sucesso', type: TestCase })
  @ApiResponse({ status: 404, description: 'Caso de teste não encontrado' })
  async attachEvidence(@Param('id') id: string, @Body('idAnexo') idAnexo: string): Promise<TestCase> {
    if (!idAnexo) {
      throw new BadRequestException('ID do anexo é obrigatório.');
    }
    return this.testCasesService.attachEvidence(id, idAnexo);
  }

  @Patch(':id/time-spent')
  @ApiOperation({ summary: 'Registra o tempo gasto em um caso de teste' })
  @ApiParam({ name: 'id', description: 'ID do caso de teste (UUID)', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tempo: { type: 'string', example: '2h30m' },
      },
      required: ['tempo'],
    },
    description: 'Tempo gasto na execução do caso de teste (ex: "1h45m").'
  })
  @ApiResponse({ status: 200, description: 'Tempo gasto registrado com sucesso', type: TestCase })
  @ApiResponse({ status: 404, description: 'Caso de teste não encontrado' })
  async registerTimeSpent(@Param('id') id: string, @Body('tempo') tempo: string): Promise<TestCase> {
    if (!tempo) {
      throw new BadRequestException('Tempo é obrigatório.');
    }
    return this.testCasesService.registerTimeSpent(id, tempo);
  }

  @Post(':id/scripts')
  @ApiOperation({ summary: 'Adiciona um script a um caso de teste' })
  @ApiParam({ name: 'id', description: 'ID do caso de teste (UUID)', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        scriptContent: { type: 'string', example: 'console.log("Teste de automação");' },
      },
      required: ['scriptContent'],
    },
    description: 'Conteúdo do script a ser adicionado.'
  })
  @ApiResponse({ status: 200, description: 'Script adicionado com sucesso', type: TestCase })
  @ApiResponse({ status: 404, description: 'Caso de teste não encontrado' })
  async addScript(@Param('id') id: string, @Body('scriptContent') scriptContent: string): Promise<TestCase> {
    if (!scriptContent) {
      throw new BadRequestException('Conteúdo do script é obrigatório.');
    }
    return this.testCasesService.addScript(id, scriptContent);
  }
}