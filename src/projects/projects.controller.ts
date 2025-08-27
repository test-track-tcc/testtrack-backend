import { Controller, Get, Post, Body, Param, Delete, Put, ParseUUIDPipe } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AddUserToProjectDto } from './dto/add-users-to-project.dto';
import { Project } from './entities/project.entity';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo projeto' })
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os projetos' })
  findAll() {
    return this.projectsService.findAll();
  }

  @Get('by-organization/:orgId')
  @ApiOperation({ summary: 'Busca todos os projetos de uma organização específica' })
  @ApiResponse({ status: 200, description: 'Lista de projetos retornada com sucesso', type: [Project] })
  findAllByOrganization(@Param('orgId', ParseUUIDPipe) orgId: string): Promise<Project[]> {
    return this.projectsService.findAllByOrganization(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um projeto pelo ID' })
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um projeto' })
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um projeto' })
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  @Post(':projectId/users')
  @ApiOperation({ summary: 'Adiciona um usuário a um projeto específico' })
  addUserToProject(
    @Param('projectId') projectId: string,
    @Body() addUserToProjectDto: AddUserToProjectDto,
  ) {
    return this.projectsService.addUserToProject(projectId, addUserToProjectDto);
  }
}