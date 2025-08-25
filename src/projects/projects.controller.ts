import { Controller, Get, Post, Body, Param, Put, Delete, NotFoundException, HttpCode } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo projeto' })
  @ApiResponse({ status: 201, description: 'Projeto criado com sucesso', type: Project })
  @ApiResponse({ status: 400, description: 'Requisição inválida' })
  @ApiBody({ type: CreateProjectDto, description: 'Dados para a criação do projeto.' })
  async create(@Body() createProjectDto: CreateProjectDto): Promise<Project> {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retorna todos os projetos' })
  @ApiResponse({ status: 200, description: 'Lista de projetos retornada com sucesso', type: [Project] })
  async findAll(): Promise<Project[]> {
    return this.projectsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um projeto pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do projeto (UUID)', type: 'string', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @ApiResponse({ status: 200, description: 'Projeto encontrado', type: Project })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado' })
  async findOne(@Param('id') id: string): Promise<Project> {
    const project = await this.projectsService.findOne(id);
    if (!project) {
      throw new NotFoundException('Project not found.');
    }
    return project;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um projeto existente' })
  @ApiParam({ name: 'id', description: 'ID do projeto (UUID)', type: 'string' })
  @ApiResponse({ status: 200, description: 'Projeto atualizado com sucesso', type: Project })
  @ApiResponse({ status: 400, description: 'Requisição inválida' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado' })
  @ApiBody({ type: UpdateProjectDto, description: 'Dados para atualização do projeto (parciais ou completos).' })
  async update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto): Promise<Project> {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove um projeto' })
  @ApiParam({ name: 'id', description: 'ID do projeto (UUID)', type: 'string' })
  @ApiResponse({ status: 204, description: 'Projeto removido com sucesso (sem conteúdo de retorno)' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado para remoção' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.projectsService.remove(id);
  }
}