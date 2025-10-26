// Caminho: src/chart/chart.service.ts
// (Corrigido)

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestCase } from '../test-case/entities/test-case.entity';
import { Bug } from '../bugs/entities/bug.entity';
// Importação CORRIGIDA: Trocado TestStatus por TestCaseStatus
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
   * Calcula as métricas de status dos casos de teste para uma organização,
   * com filtros opcionais de período e tipo de teste.
   */
  async getTestStatusMetrics(
    organizationId: string,
    period: string,
    testType: string,
  ): Promise<TestStatusMetricsDto> {
    const query = this.testCaseRepository
      .createQueryBuilder('testCase')
      .leftJoin('testCase.testScenario', 'testScenario')
      .leftJoin('testScenario.project', 'project')
      .where('project.organizationId = :organizationId', { organizationId });

    if (period && period !== 'total') {
      const now = new Date();
      let startDate: Date | undefined = undefined;

      if (period === 'mensal') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (period === 'semanal') {
        startDate = new Date(now.setDate(now.getDate() - (now.getDay() || 7))); // Ajuste para semana começar Domingo ou Segunda
      } else if (period === 'diario') {
        startDate = new Date(now.setHours(0, 0, 0, 0));
      }

      if (startDate) {
        query.andWhere('testCase.createdAt >= :startDate', { startDate });
      }
    }

    // 2. Filtro por Tipo de Teste (Ex: 'integracao', 'unidade')
    // Assumindo que 'testCase.testType' armazena essa string
    // Ajuste: O enum TestType usa 'INTEGRACAO', 'MANUAL' etc.
    if (testType && testType !== 'total') {
        // Converte o 'integracao' do frontend para 'INTEGRACAO' do backend
      query.andWhere('testCase.testType = :testType', { testType: testType.toUpperCase() });
    }

    // 3. Agrupar e Contar
    const rawCounts = await query
      .select('testCase.status', 'status')
      .addSelect('COUNT(testCase.id)', 'count')
      .groupBy('testCase.status')
      .getRawMany();

    // 4. Formatar a resposta
    const metrics: TestStatusMetricsDto = {
      success: 0,
      failure: 0,
      inProgress: 0,
      notStarted: 0,
      total: 0,
    };

    // Mapeamento CORRIGIDO do switch
    rawCounts.forEach((row) => {
      const count = parseInt(row.count, 10);
      let countedInTotal = true; // Flag para não somar 'CANCELADO' no total

      switch (row.status) {
        // Sucesso
        case TestCaseStatus.APPROVED:
        case TestCaseStatus.FINISHED:
          metrics.success += count;
          break;
        
        // Falha
        case TestCaseStatus.REPROVED:
        case TestCaseStatus.BLOCKED:
          metrics.failure += count;
          break;

        // Em Andamento
        case TestCaseStatus.IN_PROGRESS:
          metrics.inProgress += count;
          break;

        // Não Iniciado
        case TestCaseStatus.NOT_STARTED:
        case TestCaseStatus.PENDING:
          metrics.notStarted += count;
          break;
        
        // Ignorados
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