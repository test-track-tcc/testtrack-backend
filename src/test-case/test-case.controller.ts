import { Controller, Get, Post, Body, Param, Put, Patch, Delete, HttpCode, NotFoundException, BadRequestException, UseInterceptors, UploadedFile, UploadedFiles, } from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TestCasesService } from './test-case.service';
import { CreateTestCaseDto } from './dto/create-test-case.dto';
import { UpdateTestCaseDto, UpdateTestCaseStatusDto } from './dto/update-test-case.dto';
import { TestCase } from './entities/test-case.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiConsumes } from '@nestjs/swagger';

@ApiTags('test-cases')
@Controller('test-cases')
export class TestCasesController {
  constructor(private readonly testCasesService: TestCasesService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo caso de teste com todos os dados e arquivos de script.' })
  @ApiResponse({ status: 201, description: 'Caso de teste criado com sucesso', type: TestCase })
  @ApiResponse({ status: 400, description: 'Requisição inválida' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        titulo: { type: 'string' },
        descricao: { type: 'string' },
        tipoTeste: { type: 'string', enum: ['FUNCIONAL', 'REGRESSAO', 'DESEMPENHO', 'SEGURANCA', 'USABILIDADE', 'INTEGRACAO', 'ACEITACAO', 'AUTOMATIZADO', 'MANUAL'] },
        prioridade: { type: 'string', enum: ['BAIXA', 'MEDIA', 'ALTA', 'CRITICA'] },
        id_userCriacao: { type: 'string', format: 'uuid' },
        idResponsavel: { type: 'string', format: 'uuid', nullable: true },
        tempoEstimado: { type: 'string', nullable: true },
        steps: { type: 'string' },
        resultadoEsperado: { type: 'string' },
        requisitoVinculado: { type: 'string', nullable: true },
        status: { type: 'string', enum: ['PENDENTE', 'EM_ANDAMENTO', 'APROVADO', 'REPROVADO', 'BLOQUEADO', 'CANCELADO'], nullable: true },
        comentarios: { type: 'string', description: 'Array JSON stringificado de objetos {idUsuario, comentario, data}' },
        anexos: { type: 'string', description: 'Array JSON stringificado de URLs/IDs de anexos' },
        scripts: { type: 'array', items: { type: 'string', format: 'binary' }, description: 'Arquivos de script para upload' },
      },
      required: ['titulo', 'descricao', 'tipoTeste', 'prioridade', 'id_userCriacao', 'steps', 'resultadoEsperado'],
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'scripts', maxCount: 10 },
    ]),
  )
  async create(
    @UploadedFiles() files: { scripts?: Express.Multer.File[] },
    @Body() body: any,
  ): Promise<TestCase> {
    console.log('Dados recebidos no @Body():', body);
    console.log('Arquivos recebidos:', files);

    const createTestCaseDto: CreateTestCaseDto = {
      titulo: body.titulo,
      descricao: body.descricao,
      tipoTeste: body.tipoTeste,
      prioridade: body.prioridade,
      id_userCriacao: body.id_userCriacao,
      idResponsavel: body.idResponsavel || null,
      tempoEstimado: body.tempoEstimado || null,
      steps: body.steps,
      resultadoEsperado: body.resultadoEsperado,
      requisitoVinculado: body.requisitoVinculado || null,
      status: body.status || null,
      comentarios: body.comentarios ? JSON.parse(body.comentarios) : [],
      anexos: body.anexos ? JSON.parse(body.anexos) : [],
      scripts: files.scripts ? files.scripts.map((file) => file.originalname) : [],
    };

    console.log('DTO final para o Service (create):', createTestCaseDto);
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
  @ApiOperation({ summary: 'Atualiza um caso de teste existente com todos os dados e arquivos de script.' })
  @ApiParam({ name: 'id', description: 'ID do caso de teste (UUID)', type: 'string' })
  @ApiResponse({ status: 200, description: 'Caso de teste atualizado com sucesso', type: TestCase })
  @ApiResponse({ status: 400, description: 'Requisição inválida' })
  @ApiResponse({ status: 404, description: 'Caso de teste não encontrado' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        titulo: { type: 'string', nullable: true },
        descricao: { type: 'string', nullable: true },
        tipoTeste: { type: 'string', enum: ['FUNCIONAL', 'REGRESSAO', 'DESEMPENHO', 'SEGURANCA', 'USABILIDADE', 'INTEGRACAO', 'ACEITACAO', 'AUTOMATIZADO', 'MANUAL'], nullable: true },
        prioridade: { type: 'string', enum: ['BAIXA', 'MEDIA', 'ALTA', 'CRITICA'], nullable: true },
        id_userCriacao: { type: 'string', format: 'uuid', nullable: true },
        idResponsavel: { type: 'string', format: 'uuid', nullable: true },
        tempoEstimado: { type: 'string', nullable: true },
        steps: { type: 'string', nullable: true },
        resultadoEsperado: { type: 'string', nullable: true },
        requisitoVinculado: { type: 'string', nullable: true },
        status: { type: 'string', enum: ['PENDENTE', 'EM_ANDAMENTO', 'APROVADO', 'REPROVADO', 'BLOQUEADO', 'CANCELADO'], nullable: true },
        comentarios: { type: 'string', description: 'Array JSON stringificado de objetos {idUsuario, comentario, data}', nullable: true },
        anexos: { type: 'string', description: 'Array JSON stringificado de URLs/IDs de anexos', nullable: true },
        scripts: { type: 'array', items: { type: 'string', format: 'binary' }, description: 'Arquivos de script para upload (opcional)', nullable: true },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'scripts', maxCount: 10 },
    ]),
  )
  async update(
    @Param('id') id: string,
    @UploadedFiles() files: { scripts?: Express.Multer.File[] },
    @Body() body: any,
  ): Promise<TestCase> {
    console.log('Dados recebidos no @Body() para update:', body);
    console.log('Arquivos recebidos para update:', files);

    const updateTestCaseDto: UpdateTestCaseDto = { // <-- CORRIGIDO AQUI!
      titulo: body.titulo !== undefined ? body.titulo : undefined,
      descricao: body.descricao !== undefined ? body.descricao : undefined,
      tipoTeste: body.tipoTeste !== undefined ? body.tipoTeste : undefined,
      prioridade: body.prioridade !== undefined ? body.prioridade : undefined,
      id_userCriacao: body.id_userCriacao !== undefined ? body.id_userCriacao : undefined,
      idResponsavel: body.idResponsavel !== undefined ? body.idResponsavel : undefined,
      tempoEstimado: body.tempoEstimado !== undefined ? body.tempoEstimado : undefined,
      steps: body.steps !== undefined ? body.steps : undefined,
      resultadoEsperado: body.resultadoEsperado !== undefined ? body.resultadoEsperado : undefined,
      requisitoVinculado: body.requisitoVinculado !== undefined ? body.requisitoVinculado : undefined,
      status: body.status !== undefined ? body.status : undefined,
      comentarios: body.comentarios !== undefined ? JSON.parse(body.comentarios) : undefined,
      anexos: body.anexos !== undefined ? JSON.parse(body.anexos) : undefined,
      scripts: files.scripts ? files.scripts.map((file) => file.originalname) : undefined,
    };

    const filteredUpdateDto = Object.fromEntries(
      Object.entries(updateTestCaseDto).filter(([, value]) => value !== undefined)
    ) as UpdateTestCaseDto;

    console.log('DTO final para o Service (update):', filteredUpdateDto);
    const updatedTestCase = await this.testCasesService.update(id, filteredUpdateDto);
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
        comentario: { type: 'string', example: 'Este caso precisa de mais detalhes.' },
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

  @Post('upload-script')
  @ApiOperation({ summary: 'Faz upload de um arquivo de script de teste.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de script (.js, .ts, .feature, .robot)'
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'Arquivo enviado com sucesso.', schema: { type: 'object', properties: { message: { type: 'string' }, filename: { type: 'string' }, path: { type: 'string' } } } })
  @ApiResponse({ status: 400, description: 'Tipo de arquivo inválido ou nenhum arquivo enviado.' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/scripts',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const extension = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
        }
      }),
      fileFilter: (req, file, callback) => {
        const allowedTypes = ['.js', '.ts', '.feature', '.robot'];
        const ext = extname(file.originalname).toLowerCase();
        if (!allowedTypes.includes(ext)) {
          return callback(new BadRequestException('Tipo de arquivo inválido. Apenas .js, .ts, .feature, .robot são permitidos.'), false);
        }
        callback(null, true);
      }
    })
  )
  uploadScript(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }
    return {
      message: 'Arquivo enviado com sucesso!',
      filename: file.filename,
      path: file.path,
    };
  }
}
