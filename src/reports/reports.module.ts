import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TestCase } from 'src/test-case/entities/test-case.entity';
import { Project } from 'src/projects/entities/project.entity';
import { Permission } from 'src/permission/entities/permission.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { ChartModule } from 'src/chart/chart.module';
import { ReportsScheduler } from './reports.scheduler';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, TestCase, Project]),
    ChartModule,
  ],
  providers: [ReportsService, ReportsScheduler],
  controllers: [ReportsController]
})
export class ReportsModule {}
