// Caminho: src/chart/chart.controller.ts
// (Novo arquivo)

import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ChartsService } from './charts.service';
import { JwtAuthGuard } from '../auth/jtw-auth.guard';
import { TestStatusMetricsDto } from './dto/test-status-metrics.dto';

@Controller('chart')
export class ChartsController {
  constructor(private readonly chartService: ChartsService) {}

  @Get('test-status-metrics/:organizationId')
  async getTestStatusMetrics(
    @Param('organizationId') organizationId: string,
    @Query('period') period: string = 'total', // 'mensal', 'semanal', 'diario', 'total'
    @Query('testType') testType: string = 'total', // 'total', 'integracao', etc.
  ): Promise<TestStatusMetricsDto> {
    return this.chartService.getTestStatusMetrics(
      organizationId,
      period,
      testType,
    );
  }
}