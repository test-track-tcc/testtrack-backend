import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { CustomTestTypesService } from './custom-test-type.service';
import { CreateCustomTestTypeDto } from './dto/create-custom-test-type.dto';
import { UpdateCustomTestTypeDto } from './dto/update-custom-test-type.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Custom Test Types')
@Controller('organization/:organizationId/custom-test-types')
export class CustomTestTypesController {
  constructor(private readonly customTestTypesService: CustomTestTypesService) {}
  
  @Post()
  @ApiOperation({ summary: 'Create a new custom test type for an organization' })
  create(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Body() createDto: CreateCustomTestTypeDto,
  ) {
    return this.customTestTypesService.create(organizationId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all custom test types for an organization' })
  findAll(@Param('organizationId', ParseUUIDPipe) organizationId: string) {
    return this.customTestTypesService.findAllByOrganization(organizationId);
  }

  @Get(':typeId')
  @ApiOperation({ summary: 'Get a specific custom test type by its ID' })
  findOne(@Param('typeId', ParseUUIDPipe) typeId: string) {
    return this.customTestTypesService.findOne(typeId);
  }

  @Patch(':typeId')
  @ApiOperation({ summary: 'Update a custom test type' })
  update(
    @Param('typeId', ParseUUIDPipe) typeId: string,
    @Body() updateDto: UpdateCustomTestTypeDto,
  ) {
    return this.customTestTypesService.update(typeId, updateDto);
  }

  @Delete(':typeId')
  @ApiOperation({ summary: 'Delete a custom test type' })
  remove(@Param('typeId', ParseUUIDPipe) typeId: string) {
    return this.customTestTypesService.remove(typeId);
  }
}