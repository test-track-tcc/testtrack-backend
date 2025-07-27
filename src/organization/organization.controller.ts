import { Controller, Get, Post, Body, Patch, Param, Delete, Logger, Put } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AddUserToOrganizationDto } from './dto/addUserToOrganization.dto';
import { RemoveUserFromOrganizationDto } from './dto/removeUserFromOrganization.dto';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationService.create(createOrganizationDto);
  }

  @Post("/addUser")
  addUser(@Body() addUserToOrganizationDto: AddUserToOrganizationDto) {
    return this.organizationService.addUser(addUserToOrganizationDto.userId, addUserToOrganizationDto.organizationId);
  }

  @Get()
  findAll() {
    return this.organizationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationService.findOne(id);
  }

  @Get('/findByUserId/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.organizationService.findByUserId(userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) {
    return this.organizationService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    //Logger.warn(`Removendo organização com ID: ${id}`);
    return this.organizationService.remove(id);
  }

  @Delete('/removeUser')
  removeUser(@Body() removeUserFromOrganizationDto: RemoveUserFromOrganizationDto) {
    return this.organizationService.removeUser(removeUserFromOrganizationDto.userId, removeUserFromOrganizationDto.organizationId);
  }
}