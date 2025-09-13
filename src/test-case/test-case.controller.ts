import { Controller, Get, Post, Body, Param, Put, Delete, HttpCode, NotFoundException, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
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
  @ApiOperation({ summary: 'Create a new test case' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'scripts', maxCount: 10 }]))
  async create(
    @UploadedFiles() files: { scripts?: Express.Multer.File[] },
    @Body() createTestCaseDto: CreateTestCaseDto,
  ): Promise<TestCase> {
    const fieldsToParse = ['comments', 'attachments'];
    for (const field of fieldsToParse) {
      if (createTestCaseDto[field] && typeof createTestCaseDto[field] === 'string') {
        try {
          createTestCaseDto[field] = JSON.parse(createTestCaseDto[field] as string);
        } catch (e) {
          throw new BadRequestException(`Field '${field}' has invalid JSON.`);
        }
      }
    }

    if (files.scripts) {
      createTestCaseDto.scripts = files.scripts.map((file) => file.path);
    }
    
    return this.testCasesService.create(createTestCaseDto);
  }

  @Post(':id/scripts')
  @ApiOperation({ summary: 'Add a new script version to a test case' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'script', maxCount: 1 }]))
  async addScriptToTestCase(
    @Param('id') id: string,
    @UploadedFiles() files: { script?: Express.Multer.File[] },
  ) {
    if (!files.script || files.script.length === 0) {
      throw new BadRequestException('No script file uploaded.');
    }
    const scriptPath = files.script[0].path;
    return this.testCasesService.addScript(id, scriptPath);
  }

  @Get('by-project/:projectId')
  @ApiOperation({ summary: 'Return all test cases for a specific project' })
  @ApiParam({ name: 'projectId', description: 'Project ID (UUID)', type: 'string' })
  @ApiResponse({ status: 200, description: 'List of test cases returned successfully', type: [TestCase] })
  async findAllByProject(@Param('projectId') projectId: string): Promise<TestCase[]> {
    return this.testCasesService.findAllByProject(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a test case by ID' })
  @ApiParam({ name: 'id', description: 'Test case ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Test case found', type: TestCase })
  @ApiResponse({ status: 404, description: 'Test case not found' })
  async findOne(@Param('id') id: string): Promise<TestCase> {
    const testCase = await this.testCasesService.findOne(id);
    if (!testCase) {
      throw new NotFoundException('Test case not found.');
    }
    return testCase;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing test case' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'scripts', maxCount: 10 }]))
  async update(
    @Param('id') id: string,
    @UploadedFiles() files: { scripts?: Express.Multer.File[] },
    @Body() updateTestCaseDto: UpdateTestCaseDto,
  ): Promise<TestCase> {
    // A lógica para parsear JSON e tratar arquivos fica no controller
    const fieldsToParse = ['comments', 'attachments'];
    for (const field of fieldsToParse) {
        if (updateTestCaseDto[field] && typeof updateTestCaseDto[field] === 'string') {
            try {
                updateTestCaseDto[field] = JSON.parse(updateTestCaseDto[field] as string);
            } catch (e) {
                throw new BadRequestException(`Field '${field}' has invalid JSON.`);
            }
        }
    }
    
    if (files.scripts) {
        // Se precisar lidar com atualização de scripts, a lógica viria aqui
        // Por exemplo: updateTestCaseDto.scripts = files.scripts.map(file => file.path);
    }

    return this.testCasesService.update(id, updateTestCaseDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove a test case' })
  @ApiParam({ name: 'id', description: 'Test case ID (UUID)' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.testCasesService.remove(id);
  }
}