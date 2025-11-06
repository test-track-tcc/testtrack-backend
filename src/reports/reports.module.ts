import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TestCase } from '../test-case/entities/test-case.entity';
import { Project } from '../projects/entities/project.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { ChartModule } from '../chart/chart.module';
import { ReportsScheduler } from './reports.scheduler';
import { PdfGeneratorModule } from '../pdf-generator/pdf-generator.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, TestCase, Project]),
    ChartModule,
    PdfGeneratorModule,
  ],
  providers: [ReportsService, ReportsScheduler],
  controllers: [ReportsController]
})
export class ReportsModule {}
