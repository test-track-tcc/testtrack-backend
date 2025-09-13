import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CustomTestTypesService } from './custom-test-type.service';
import { CreateCustomTestTypeDto } from './dto/create-custom-test-type.dto';
import { UpdateCustomTestTypeDto } from './dto/update-custom-test-type.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Custom Test Types')
@Controller('projects/:projectId/custom-test-types')
export class CustomTestTypesController {
  constructor(private readonly customTestTypesService: CustomTestTypesService) {}
  
  @Post()
  @ApiOperation({ summary: 'Create a new custom test type for a project' })
  @ApiResponse({ status: 201, description: 'The test type has been successfully created.'})
  create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() createDto: CreateCustomTestTypeDto,
  ) {
    return this.customTestTypesService.create(projectId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all custom test types for a project' })
  findAll(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.customTestTypesService.findAllByProject(projectId);
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
  @ApiResponse({ status: 204, description: 'The test type has been successfully deleted.'})
  remove(@Param('typeId', ParseUUIDPipe) typeId: string) {
    return this.customTestTypesService.remove(typeId);
  }
}