import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestCase } from '../test-case/entities/test-case.entity';
import { Bug } from '../bugs/entities/bug.entity';
import { TestCaseStatus } from '../config/enums'; 
import { TestStatusMetricsDto } from './dto/test-status-metrics.dto';

@Injectable()
export class ChartsService {
  constructor(
    @InjectRepository(TestCase)
    private testCaseRepository: Repository<TestCase>,
    @InjectRepository(Bug)
    private bugRepository: Repository<Bug>,
  ) {}

  /**
   * Calcula as métricas de status dos casos de teste para UM PROJETO,
   * com filtros opcionais de período e tipo de teste.
   */
  async getTestStatusMetrics(
    projectId: string,
    period: string,
    testType: string,
  ): Promise<TestStatusMetricsDto> {
    const query = this.testCaseRepository
      .createQueryBuilder('testCase')
      .where('testCase.projectId = :projectId', { projectId });

    if (period && period !== 'total') {
      const now = new Date();
      let startDate: Date | undefined = undefined;

      if (period === 'mensal') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (period === 'semanal') {
        startDate = new Date(now.setDate(now.getDate() - (now.getDay() || 7)));
      } else if (period === 'diario') {
        startDate = new Date(now.setHours(0, 0, 0, 0));
      }

      if (startDate) {
        query.andWhere('testCase.createdAt >= :startDate', { startDate });
      }
    }

    if (testType && testType !== 'total') {
      query.andWhere('testCase.testType = :testType', { testType: testType.toUpperCase() });
    }

    const rawCounts = await query
      .select('testCase.status', 'status')
      .addSelect('COUNT(testCase.id)', 'count')
      .groupBy('testCase.status')
      .getRawMany();

    const metrics: TestStatusMetricsDto = {
      success: 0,
      failure: 0,
      inProgress: 0,
      notStarted: 0,
      total: 0,
    };

    rawCounts.forEach((row) => {
      const count = parseInt(row.count, 10);
      let countedInTotal = true; 

      switch (row.status) {
        case TestCaseStatus.APPROVED:
        case TestCaseStatus.FINISHED:
          metrics.success += count;
          break;
        
        case TestCaseStatus.REPROVED:
        case TestCaseStatus.BLOCKED:
          metrics.failure += count;
          break;

        case TestCaseStatus.IN_PROGRESS:
          metrics.inProgress += count;
          break;

        case TestCaseStatus.NOT_STARTED:
        case TestCaseStatus.PENDING:
          metrics.notStarted += count;
          break;
        
        case TestCaseStatus.CANCELED:
          countedInTotal = false;
          break;
      }

      if (countedInTotal) {
        metrics.total += count;
      }
    });

    return metrics;
  }
}