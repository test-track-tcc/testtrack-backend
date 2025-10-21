import { Injectable, Logger } from '@nestjs/common';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration } from 'chart.js';
import { TestCaseStatus } from 'src/config/enums';
import { Report } from 'src/reports/entities/report.entity';
import { TestCase } from 'src/test-case/entities/test-case.entity';

@Injectable()
export class ChartService {
  public readonly statusColors = {
    [TestCaseStatus.APPROVED]: '#377b1f', // Verde
    [TestCaseStatus.REPROVED]: '#c24646',   // Vermelho
    [TestCaseStatus.PENDING]: '#17a2b8',  // Amarelo
    [TestCaseStatus.NOT_STARTED]: '#3745aa', // Azul
    [TestCaseStatus.BLOCKED]: '#9268ad',//'#9268adff', // Cinza
    [TestCaseStatus.IN_PROGRESS]: '#ffd446', // Ciano
    [TestCaseStatus.FINISHED]: '#fd7e14', // Laranja
    [TestCaseStatus.CANCELED]: '#343a40', // Preto
  };
/*
  public async createDonutChart(data: Map<string, number>): Promise<Buffer> {
    const width = 400;
    const height = 400;
    
    // Prepara os dados para o formato que o Chart.js espera
    const labels = Array.from(data.keys());
    const values = Array.from(data.values());
    const backgroundColors = labels.map(label => this.statusColors[label] || '#6c757d'); // Cor cinza para status não mapeados

    const configuration: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Total de Testes',
            data: values,
            backgroundColor: backgroundColors,
            //borderColor: '#343a40', // Cor de fundo do seu app
            borderWidth: 0 // Volta pra 2,
          },
        ],
      },
      options: {
        responsive: false,
        plugins: {
          legend: {
            display: false, // Vamos criar a legenda manualmente no PDF
          },
          title: {
            display: true,
            text: 'Distribuição de Status dos Testes',
            font: { size: 18 },
            color: '#000000ff'
          },
        },
      },
    };

    const chartJSNodeCanvas = new ChartJSNodeCanvas({ 
      width, 
      height, 
      //backgroundColour: '#343a40' // Cor de fundo escura
    });

    return chartJSNodeCanvas.renderToBuffer(configuration, 'image/png');
  }
*/


  public async createDonutChart(data: Map<string, number>): Promise<Buffer> {
    const width = 600;
    const height = 600;

    const labels = Array.from(data.keys());
    const values = Array.from(data.values());
    const backgroundColors = labels.map(label => this.statusColors[label] || '#6c757d');
    const totalTests = values.reduce((sum, current) => sum + current, 0);

    // PLUGIN CUSTOMIZADO PARA O TEXTO CENTRAL
    // Este plugin desenha o texto "Total Testes" no centro do gráfico.
    const centerTextPlugin = {
      id: 'centerText',
      afterDraw: (chart) => {
        const ctx = chart.ctx;
        const centerX = chart.width / 2;
        const centerY = chart.height / 2;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Texto "Total"
        ctx.font = 'bold 30px sans-serif';
        ctx.fillStyle = '#666';
        ctx.fillText('Total', centerX, centerY - 45);

        // Texto "Testes"
        ctx.font = 'bold 30px sans-serif';
        ctx.fillStyle = '#666';
        ctx.fillText('Testes', centerX, centerY + 45);
        ctx.restore();
      },
    };

    const configuration: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
          {
            data: values,
            backgroundColor: backgroundColors,
            borderColor: '#ffffff', // Borda branca entre as fatias
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: false,
        plugins: {
          title: {
            display: false,
          },
          legend: {
            display: false,
          },
        },
      },
      // Registramos nosso plugin customizado
      plugins: [centerTextPlugin],
    };

    const chartJSNodeCanvas = new ChartJSNodeCanvas({ 
      width, 
      height, 
    });

    return chartJSNodeCanvas.renderToBuffer(configuration, 'image/png');
  }

}