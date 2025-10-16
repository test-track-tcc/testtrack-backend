import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReportsService } from './reports.service';

@Injectable()
export class ReportsScheduler {
  private readonly logger = new Logger(ReportsScheduler.name);

  constructor(private readonly reportsService: ReportsService) {}

  @Cron(CronExpression.EVERY_WEEK, {
    name: 'weekly_test_report',
    timeZone: 'America/Sao_Paulo',
  })
  public async handleCron(): Promise<void> {
    this.logger.log('Gatilho do agendador disparado — iniciando geração de relatório...');
    try {
      // await garante que erros sejam capturados aqui
      await this.reportsService.generateWeeklyReport();
      this.logger.log('Relatório gerado com sucesso.');
    } catch (error) {
      this.logger.error('Erro ao gerar relatório agendado:', error);
    }
  }
}