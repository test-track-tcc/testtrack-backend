import { Injectable, Logger } from '@nestjs/common';
import fetch from 'node-fetch';
import { TestCaseStatus } from '../config/enums';

@Injectable()
export class ChartService {
  private readonly logger = new Logger(ChartService.name);

  public readonly statusColors = {
    [TestCaseStatus.APPROVED]: '#377b1f',
    [TestCaseStatus.REPROVED]: '#c24646',
    [TestCaseStatus.PENDING]: '#17a2b8',
    [TestCaseStatus.NOT_STARTED]: '#3745aa',
    [TestCaseStatus.BLOCKED]: '#9268ad',
    [TestCaseStatus.IN_PROGRESS]: '#ffd446',
    [TestCaseStatus.FINISHED]: '#fd7e14',
    [TestCaseStatus.CANCELED]: '#343a40',
  };

  public async createDonutChart(data: Map<string, number>): Promise<Buffer> {
    const labels = Array.from(data.keys());
    const values = Array.from(data.values());
    const backgroundColors = labels.map(label => this.statusColors[label] || '#6c757d');

    const chartData = {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: backgroundColors,
            borderColor: '#ffffff',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: false,
        plugins: {
          legend: { display: false },
          title: { display: false },
        },
      },
    };

    const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartData))}&backgroundColor=white&width=600&height=600`;

    this.logger.log(`Gerando gráfico via QuickChart: ${chartUrl}`);

    const response = await fetch(chartUrl);
    if (!response.ok) throw new Error(`Erro ao gerar gráfico: ${response.statusText}`);

    return Buffer.from(await response.arrayBuffer());
  }
}
