import { Injectable } from '@nestjs/common';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration } from 'chart.js';
import { TestCaseStatus } from 'src/config/enums';
import { Report } from 'src/reports/entities/report.entity';
import { TestCase } from 'src/test-case/entities/test-case.entity';

@Injectable()
export class ChartService {
  public readonly statusColors = {
    [TestCaseStatus.APPROVED]: '#28a745', // Verde
    [TestCaseStatus.REPROVED]: '#dc3545',   // Vermelho
    [TestCaseStatus.PENDING]: '#ffc107',  // Amarelo
    [TestCaseStatus.NOT_STARTED]: '#007bff', // Azul
    [TestCaseStatus.BLOCKED]: '#b07bd3ff', // Cinza
    [TestCaseStatus.IN_PROGRESS]: '#17a2b8', // Ciano
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
    // 1. Aumentamos a largura para acomodar a legenda ao lado
    const width = 600;
    const height = 600;

    const labels = Array.from(data.keys());
    const values = Array.from(data.values());
    const backgroundColors = labels.map(label => this.statusColors[label] || '#6c757d');
    const totalTests = values.reduce((sum, current) => sum + current, 0);

    // --- PLUGIN CUSTOMIZADO PARA O TEXTO CENTRAL ---
    // Este plugin desenha o texto "Total Testes" no centro do gráfico.
    const centerTextPlugin = {
      id: 'centerText',
      afterDraw: (chart) => {
        const ctx = chart.ctx;
        const centerX = chart.width / 3 ;
        const centerY = chart.height / 2;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Texto "Total"
        ctx.font = 'bold 30px sans-serif';
        ctx.fillStyle = '#666';
        ctx.fillText('Total', centerX, centerY - 10);

        // Texto "Testes"
        ctx.font = 'bold 30px sans-serif';
        ctx.fillStyle = '#666';
        ctx.fillText('Testes', centerX, centerY + 20);
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
          // 2. Desabilitamos o título superior
          title: {
            display: false,
          },
          // 3. Habilitamos e configuramos a legenda
          legend: {
            display: true,
            position: 'right', // Posiciona a legenda à direita
            align: 'center',   // Alinha a legenda verticalmente ao centro
            labels: {
              boxWidth: 15, // Largura da caixa de cor
              padding: 20,  // Espaçamento entre os itens
              color: '#333',
              font: {
                size: 12,
              },
              // Função para formatar o texto de cada item da legenda
              generateLabels: (chart) => {
                const datasets = chart.data.datasets;
                return datasets[0].data.map((value, i) => {
                  let label = {};
                  if (chart.data.labels) {
                    label = chart.data.labels[i] ?? '';
                  }
                  const percentage = totalTests > 0 ? ((Number(value) / totalTests) * 100).toFixed(0) : 0;
                  const backgroundColor = (datasets[0].backgroundColor as string[])[i];

                  return {
                    text: `${value} em ${label} (${percentage}%)`,
                    fillStyle: backgroundColor,
                    strokeStyle: backgroundColor,
                    lineWidth: 1,
                    hidden: false,
                    index: i,
                  };
                });
              },
            },
          },
        },
      },
      // 4. Registramos nosso plugin customizado
      plugins: [centerTextPlugin],
    };

    const chartJSNodeCanvas = new ChartJSNodeCanvas({ 
      width, 
      height, 
    });

    return chartJSNodeCanvas.renderToBuffer(configuration, 'image/png');
  }

}