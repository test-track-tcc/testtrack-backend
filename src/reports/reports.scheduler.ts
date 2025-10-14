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
  handleCron() {
    this.logger.log('Gatilho do agendador de relatórios semanais disparado...');
    this.reportsService.generateWeeklyReport();
  }
}