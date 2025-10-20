import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AddUserToOrganizationDto } from './dto/addUserToOrganization.dto';
import { OrganizationRole } from './entities/organization-user.entity';
import { Organization } from './entities/organization.entity';
import { AuthGuard } from '@nestjs/passport';

class UpdateUserRoleDto {
  role: OrganizationRole;
}

class AddUserToOrganizationWithRoleDto extends AddUserToOrganizationDto {
    role: OrganizationRole;
}

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationService.create(createOrganizationDto);
  }

  @Post("/addUser")
  addUser(@Body() addUserDto: AddUserToOrganizationWithRoleDto) {
    return this.organizationService.inviteUserToOrganization(
      addUserDto.userId, 
      addUserDto.organizationId, 
      addUserDto.role
    );
  }

@Patch('/invites/:id/accept')
  @UseGuards(AuthGuard('jwt')) 
  acceptInvite(
    @Param('id') membershipId: string,
    @Req() req: any, 
  ) {
    const authUserId = req.user.id;
    return this.organizationService.acceptOrganizationInvite(membershipId, authUserId);
  }

  @Get()
  findAll() {
    return this.organizationService.findAll();
  }
  
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationService.findOne(id);
  }

  @Get('user/:userId')
  async findOrganizationsByUser(@Param('userId') userId: string): Promise<Organization[]> {
    return this.organizationService.findByUserId(userId);
  }

  @Get(':id/users')
  findUsersByOrganization(@Param('id') id: string) {
    return this.organizationService.findUsersByOrganization(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) {
    return this.organizationService.update(id, updateOrganizationDto);
  }

  @Patch(':organizationId/users/:userId/role')
  updateUserRole(
    @Param('organizationId') organizationId: string,
    @Param('userId') userId: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.organizationService.updateUserRole(userId, organizationId, updateUserRoleDto.role);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizationService.remove(id);
  }

  @Delete(':organizationId/users/:userId')
  removeUserFromOrganization(
    @Param('organizationId') organizationId: string,
    @Param('userId') userId: string,
  ) {
    return this.organizationService.removeUser(userId, organizationId);
  }
}