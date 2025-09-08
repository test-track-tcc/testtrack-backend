import { Controller, Get, Post, Body, Param, Put, Delete, HttpCode, NotFoundException, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { TestCasesService } from './test-case.service';
import { CreateTestCaseDto } from './dto/create-test-case.dto';
import { UpdateTestCaseDto } from './dto/update-test-case.dto';
import { TestCase } from './entities/test-case.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiConsumes } from '@nestjs/swagger';

@ApiTags('test-cases')
@Controller('test-cases')
export class TestCasesController {
  constructor(private readonly testCasesService: TestCasesService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo caso de teste para um projeto' })
  @ApiResponse({ status: 201, description: 'Caso de teste criado com sucesso', type: TestCase })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'scripts', maxCount: 10 }]))
  async create(
    @UploadedFiles() files: { scripts?: Express.Multer.File[] },
    @Body() createTestCaseDto: CreateTestCaseDto,
  ): Promise<TestCase> {
    if (typeof createTestCaseDto.comments === 'string') {
      createTestCaseDto.comments = JSON.parse(createTestCaseDto.comments);
    }
    if (typeof createTestCaseDto.attachments === 'string') {
      createTestCaseDto.attachments = JSON.parse(createTestCaseDto.attachments);
    }

    if (files.scripts) {
      createTestCaseDto.scripts = files.scripts.map((file) => file.path);
    }

    return this.testCasesService.create(createTestCaseDto);
  }

  @Get('by-project/:projectId')
  @ApiOperation({ summary: 'Retorna todos os casos de teste de um projeto específico' })
  @ApiParam({ name: 'projectId', description: 'ID do projeto (UUID)', type: 'string' })
  @ApiResponse({ status: 200, description: 'Lista de casos de teste retornada com sucesso', type: [TestCase] })
  async findAllByProject(@Param('projectId') projectId: string): Promise<TestCase[]> {
    return this.testCasesService.findAllByProject(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um caso de teste pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do caso de teste (UUID)' })
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
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'scripts', maxCount: 10 }]))
  async update(
    @Param('id') id: string,
    @UploadedFiles() files: { scripts?: Express.Multer.File[] },
    @Body() updateTestCaseDto: UpdateTestCaseDto,
  ): Promise<TestCase> {
    if (typeof updateTestCaseDto.comments === 'string') {
        updateTestCaseDto.comments = JSON.parse(updateTestCaseDto.comments);
    }
    if (typeof updateTestCaseDto.attachments === 'string') {
        updateTestCaseDto.attachments = JSON.parse(updateTestCaseDto.attachments);
    }
    if (files.scripts) {
        updateTestCaseDto.scripts = files.scripts.map((file) => file.path);
    }

    return this.testCasesService.update(id, updateTestCaseDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove um caso de teste' })
  @ApiParam({ name: 'id', description: 'ID do caso de teste (UUID)' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.testCasesService.remove(id);
  }
}