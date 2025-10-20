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
import { BugsService } from './bugs.service';
import { AssignDeveloperDto } from './dto/assign-developer.dto';
import { Bug } from './entities/bug.entity';

@Controller('bugs')
export class BugsController {
  constructor(private readonly bugsService: BugsService) {}

  @Get()
  findAll(): Promise<Bug[]> {
    return this.bugsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Bug> {
    return this.bugsService.findOne(id);
  }

  @Patch(':id/assign')
  assignDeveloper(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignDeveloperDto: AssignDeveloperDto,
  ): Promise<Bug> {
    return this.bugsService.assignDeveloper(id, assignDeveloperDto.developerId);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.bugsService.remove(id);
  }
}