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
        title: { type: 'string' },
        description: { type: 'string' },
        testType: { type: 'string', enum: ['FUNCIONAL', 'REGRESSAO', 'DESEMPENHO', 'SEGURANCA', 'USABILIDADE', 'INTEGRACAO', 'ACEITACAO', 'AUTOMATIZADO', 'MANUAL'] },
        priority: { type: 'string', enum: ['BAIXA', 'MEDIA', 'ALTA', 'CRITICA'] },
        idCreatedBy: { type: 'string', format: 'uuid' },
        idResponsible: { type: 'string', format: 'uuid', nullable: true },
        timeEstimated: { type: 'string', nullable: true },
        steps: { type: 'string' },
        expectedResult: { type: 'string' },
        taskLink: { type: 'string', nullable: true },
        status: { type: 'string', enum: ['PENDENTE', 'EM_ANDAMENTO', 'APROVADO', 'REPROVADO', 'BLOQUEADO', 'CANCELADO'], nullable: true },
        comments: { type: 'string', description: 'Array JSON stringificado de objetos {idUsuario, comentario, data}' },
        attachments: { type: 'string', description: 'Array JSON stringificado de URLs/IDs de anexos' },
        scripts: { type: 'array', items: { type: 'string', format: 'binary' }, description: 'Arquivos de script para upload' },
      },
      required: ['title', 'description', 'testType', 'priority', 'idCreatedBy', 'steps', 'expectedResult'],
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
      title: body.title,
      description: body.description,
      testType: body.testType,
      priority: body.priority,
      idCreatedBy: body.idCreatedBy,
      idResponsible: body.idResponsible || null,
      estimatedTime: body.estimatedTime || null,
      steps: body.steps,
      expectedResult: body.expectedResult,
      taskLink: body.taskLink || null,
      status: body.status || null,
      comments: body.comments ? JSON.parse(body.comentarios) : [],
      attachments: body.attachments ? JSON.parse(body.anexos) : [],
      scripts: body.scripts ?? [],
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
        title: { type: 'string', nullable: true },
        description: { type: 'string', nullable: true },
        testType: { type: 'string', enum: ['FUNCIONAL', 'REGRESSAO', 'DESEMPENHO', 'SEGURANCA', 'USABILIDADE', 'INTEGRACAO', 'ACEITACAO', 'AUTOMATIZADO', 'MANUAL'], nullable: true },
        priority: { type: 'string', enum: ['BAIXA', 'MEDIA', 'ALTA', 'CRITICA'], nullable: true },
        idCreatedBy: { type: 'string', format: 'uuid', nullable: true },
        idResponsible: { type: 'string', format: 'uuid', nullable: true },
        estimatedTime: { type: 'string', nullable: true },
        steps: { type: 'string', nullable: true },
        expectedResult: { type: 'string', nullable: true },
        taskLink: { type: 'string', nullable: true },
        status: { type: 'string', enum: ['PENDENTE', 'EM_ANDAMENTO', 'APROVADO', 'REPROVADO', 'BLOQUEADO', 'CANCELADO'], nullable: true },
        comments: { type: 'string', description: 'Array JSON stringificado de objetos {idUsuario, comentario, data}', nullable: true },
        attachments: { type: 'string', description: 'Array JSON stringificado de URLs/IDs de anexos', nullable: true },
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

    const updateTestCaseDto: UpdateTestCaseDto = {
      title: body.title !== undefined ? body.title : undefined,
      description: body.description !== undefined ? body.description : undefined,
      testType: body.testType !== undefined ? body.testType : undefined,
      priority: body.priority !== undefined ? body.priority : undefined,
      idCreatedBy: body.idCreatedBy !== undefined ? body.idCreatedBy : undefined,
      idResponsible: body.idResponsible !== undefined ? body.idResponsible : undefined,
      estimatedTime: body.estimatedTime !== undefined ? body.estimatedTime : undefined,
      steps: body.steps !== undefined ? body.steps : undefined,
      expectedResult: body.expectedResult !== undefined ? body.expectedResult : undefined,
      taskLink: body.taskLink !== undefined ? body.taskLink : undefined,
      status: body.status !== undefined ? body.status : undefined,
      comments: body.comments !== undefined ? JSON.parse(body.comments) : undefined,
      attachments: body.attachments !== undefined ? JSON.parse(body.attachments) : undefined,
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
