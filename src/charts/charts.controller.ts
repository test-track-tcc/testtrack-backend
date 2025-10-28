import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ChartsService } from './charts.service';
import { TestStatusMetricsDto } from './dto/test-status-metrics.dto';

@Controller('chart')
export class ChartsController {
  constructor(private readonly chartService: ChartsService) {}

  @Get('test-status-metrics/:projectId')
  async getTestStatusMetrics(
    @Param('projectId') projectId: string,
    @Query('period') period: string = 'total',
    @Query('testType') testType: string = 'total', 
  ): Promise<TestStatusMetricsDto> {
    return this.chartService.getTestStatusMetrics(
      projectId,
      period,
      testType,
    );
  }
}