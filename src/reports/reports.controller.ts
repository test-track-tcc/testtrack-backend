import { Controller, Get, Param, ParseUUIDPipe, Res, StreamableFile } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { createReadStream } from 'fs';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os relatórios gerados' })
  findAll() {
    return this.reportsService.findAll();
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Fazer o download de um relatório em PDF' })
  @ApiResponse({ status: 200, description: 'Download do arquivo PDF.'})
  async downloadReport(
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const report = await this.reportsService.findOne(id);
    const file = createReadStream(report.filePath);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${report.fileName}"`,
    });
    
    return new StreamableFile(file);
  }

  @Get('trigger-all-projects-manual-report')
  @ApiOperation({ summary: 'Dispara manualmente a geração do relatório semanal' })
  async triggerManualReport() {
      await this.reportsService.generateWeeklyReport();
      return { message: 'Geração de relatórios iniciada. Verifique os logs e a pasta private/reports.' };
  }

  @Get('trigger-personalized-report/:projectId/:startDate/:endDate')
  @ApiOperation({ summary: 'Dispara manualmente a geração de um relatório personalizado para um projeto e intervalo' })
  async triggerPersonalizedReport(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('startDate') startDateStr: string,
    @Param('endDate') endDateStr: string,
  ) {
      // Converte as strings de data para objetos Date, DETALHE! Não há validação avançada aqui!!!
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      await this.reportsService.generatePersonalizedIntervalReport(projectId, startDate, endDate);
      return { message: 'Geração de relatório personalizado iniciada. Verifique os logs e a pasta private/reports.' };
  }
}