import { Controller, Get, Post, Body, Patch, Param, Delete, Logger, Put } from '@nestjs/common';
import { CreateAccessGroupDto } from './dto/create-access-group.dto';
import { AccessGroupService } from './access-group.service';
import { UpdateAccessGroupDto } from './dto/update-access-group.dto';
import { RemoveUserFromAccessGroupDto } from './dto/remove-user-to-group.dto';

@Controller('access-group')
export class AccessGroupController {
  constructor(private readonly accessGroupService: AccessGroupService) {}

  @Post()
  create(@Body() createAccessGroupDto: CreateAccessGroupDto) {
    return this.accessGroupService.create(createAccessGroupDto);
  }

  @Post('/addUser')
  addUser(@Body('groupId') groupId: string, @Body('userId') userId: string) {
    return this.accessGroupService.addUser(groupId, userId);
  }

  @Get()
  findAll() {
    return this.accessGroupService.findAll();
  }

  @Get('organization/:orgId')
  findAllInOrg(@Param('orgId') orgId: string) {
    return this.accessGroupService.findAllInOrg(orgId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.accessGroupService.findOne(id);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.accessGroupService.remove(id);
  }

  @Delete(":groupId/users/:userId")
  removeUser(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,) {
    return this.accessGroupService.removeUser(groupId, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccessGroupDto: UpdateAccessGroupDto) {
    return this.accessGroupService.update(id, updateAccessGroupDto);
  }
}