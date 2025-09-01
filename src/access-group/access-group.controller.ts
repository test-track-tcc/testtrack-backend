import { Controller, Get, Post, Body, Patch, Param, Delete, Logger, Put } from '@nestjs/common';
import { CreateAccessGroupDto } from './dto/create-access-group.dto';
import { AccessGroupService } from './access-group.service';

@Controller('access-group')
export class AccessGroupController {
  constructor(private readonly accessGroupService: AccessGroupService) {}

  @Post()
  create(@Body() createAccessGroupDto: CreateAccessGroupDto) {
    return this.accessGroupService.create(createAccessGroupDto);
  }

  @Get()
  findAll() {
    return this.accessGroupService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.accessGroupService.findOne(id);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.accessGroupService.remove(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccessGroupDto: UpdateAccessGroupDto) {
    return this.accessGroupService.update(id, updateAccessGroupDto);
  }
}