import { Controller, Get, Post, Body, Param, Put, Delete, NotFoundException, HttpCode } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso', type: User })
  @ApiResponse({ status: 400, description: 'Requisição inválida ou e-mail já em uso' })
  @ApiBody({ type: CreateUserDto, description: 'Dados para a criação do usuário.' })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os usuários' })
  @ApiResponse({ status: 200, description: 'Lista de usuários retornada com sucesso', type: [User] })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um usuário pelo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário (UUID)',
    type: 'string',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef'
  })
  @ApiResponse({ status: 200, description: 'Usuário encontrado', type: User })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return user;
  }


  @Get('email/:email')
  @ApiOperation({ summary: 'Busca um usuário pelo email' })
  @ApiParam({ name: 'email', description: 'Email do usuário', type: 'string' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado', type: User })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async findByEmail(@Param('email') email: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return user;
  }

  @Get(':id/projects')
  @ApiOperation({ summary: 'Lista todos os projetos associados a um usuário' })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário (UUID)',
    type: 'string',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef'
  })
  @ApiResponse({ status: 200, description: 'Lista de projetos retornada com sucesso', type: [Object] })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async findUserProjects(@Param('id') id: string): Promise<User> {
    return this.usersService.findAccessibleProjects(id);
  }

  // Rota: GET /users/:userId/organizations/:organizationId/projects
  @Get(':userId/organizations/:organizationId/projects')
  @ApiOperation({ summary: 'Busca os projetos acessíveis por um usuário em uma organização' })
  // @UseGuards(...) // Lembre-se de proteger suas rotas!
  findUserProjectsInOrganization(
    @Param('userId') userId: string,
    @Param('organizationId') organizationId: string,
  ) {
    return this.usersService.findUserProjectsInOrganization(userId, organizationId);
  }

  @Get(':id/organizations')
  @ApiOperation({ summary: 'Lista as organizações associadas a um usuário' })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário (UUID)',
    type: 'string',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef'
  })
  @ApiResponse({ status: 200, description: 'Lista de organizações retornada com sucesso', type: [Object] })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async findUserOrganizations(@Param('id') id: string): Promise<any[]> {
    return this.usersService.findUserOrganizations(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um usuário existente' })
  @ApiParam({ name: 'id', description: 'ID do usuário (UUID)', type: 'string' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso', type: User })
  @ApiResponse({ status: 400, description: 'Requisição inválida' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiBody({ type: UpdateUserDto, description: 'Dados para atualização do usuário (parciais ou completos).' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    const updatedUser = await this.usersService.update(id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException('User not found or update failed.');
    }
    return updatedUser;
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove um usuário' })
  @ApiParam({ name: 'id', description: 'ID do usuário (UUID)', type: 'string' })
  @ApiResponse({ status: 204, description: 'Usuário removido com sucesso (sem conteúdo de retorno)' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado para remoção' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.usersService.remove(id);
  }
}
