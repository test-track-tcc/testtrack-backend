import { Controller, Get, Param, BadRequestException } from '@nestjs/common';
import { ScriptsService } from './scripts.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Script } from '../test-case/entities/script.entity';

@ApiTags('scripts')
@Controller('scripts')
export class ScriptsController {
  constructor(private readonly scriptsService: ScriptsService) {}

  @Get('by-project/:projectId')
  @ApiOperation({ summary: 'Find all scripts by organization' })
  @ApiParam({ name: 'orgId', description: 'Organization ID (UUID)', type: 'string' })
  @ApiResponse({ status: 200, description: 'List of scripts returned successfully', type: [Script] })
  async findAllByProject(@Param('projectId') projectId: any): Promise<Script[]> { 
    console.log('BACKEND: Recebido projectId:', projectId, typeof projectId);

    if (typeof projectId !== 'string') {
       throw new BadRequestException('Formato inválido para Project ID');
    }
    return this.scriptsService.findAllByProject(projectId as string);
}
}