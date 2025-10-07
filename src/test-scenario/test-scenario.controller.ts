import { Controller, Get, Post, Body, Param, Put, Delete, NotFoundException, HttpCode } from '@nestjs/common';
import { TestScenarioService } from './test-scenario.service';
import { CreateTestScenarioDto } from './dto/create-test-scenario.dto';
import { UpdateTestScenarioDto } from './dto/update-test-scenario.dto';
import { TestScenario } from './entities/test-scenario.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('test-scenarios')
@Controller('test-scenarios')
export class TestScenarioController {
  constructor(private readonly testScenarioService: TestScenarioService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo cenário de teste' })
  @ApiResponse({ status: 201, description: 'Cenário de teste criado com sucesso.', type: TestScenario })
  create(@Body() createTestScenarioDto: CreateTestScenarioDto): Promise<TestScenario> {
    return this.testScenarioService.create(createTestScenarioDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os cenários de teste' })
  @ApiResponse({ status: 200, description: 'Lista de cenários de teste.', type: [TestScenario] })
  findAll(): Promise<TestScenario[]> {
    return this.testScenarioService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um cenário de teste pelo ID' })
  @ApiResponse({ status: 200, description: 'Cenário de teste encontrado.', type: TestScenario })
  async findOne(@Param('id') id: string): Promise<TestScenario> {
    const scenario = await this.testScenarioService.findOne(id);
    if (!scenario) {
      throw new NotFoundException('Cenário de teste não encontrado.');
    }
    return scenario;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um cenário de teste' })
  @ApiResponse({ status: 200, description: 'Cenário de teste atualizado com sucesso.', type: TestScenario })
  update(@Param('id') id: string, @Body() updateTestScenarioDto: UpdateTestScenarioDto): Promise<TestScenario> {
    return this.testScenarioService.update(id, updateTestScenarioDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove um cenário de teste' })
  @ApiResponse({ status: 204, description: 'Cenário de teste removido com sucesso.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.testScenarioService.remove(id);
  }
}