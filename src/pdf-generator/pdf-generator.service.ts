import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ChartService } from 'src/chart/chart.service';
import PDFDocument = require('pdfkit'); // Correção de importação para compatibilidade com TypeScript
import * as fs from 'fs';
import { TestCaseStatus } from 'src/config/enums';

// Criamos uma interface para o contrato de dados, tornando o código mais seguro e legível
export interface ReportData {
  statuses: Map<string, number>;
}

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);

  constructor(private readonly chartService: ChartService) {}

  /**
   * Gera um PDF de relatório de testes e o salva no caminho especificado.
   * Lança uma exceção em caso de falha.
   */
  public async tryGenerateTestReportPdf(
    filePath: string,
    data: ReportData,
    startDate: Date,
    endDate: Date,
    projectName: string,
  ): Promise<boolean> {
    this.logger.log(`Iniciando geração do PDF para o projeto "${projectName}" em "${filePath}"`);

    try {
      const chartBuffer = await this.chartService.createDonutChart(data.statuses);

      // A geração do PDF é envolvida por uma Promise para lidar com streams de forma assíncrona
      return await new Promise<boolean>((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Construção do Documento
        this.buildPdfHeader(doc, projectName, startDate, endDate);
        this.buildPdfBody(doc, data, chartBuffer);

        doc.end();

        stream.on('finish', () => {
          this.logger.log(`PDF salvo com sucesso em "${filePath}"`);
          resolve(true);
        });

        stream.on('error', (err) => {
          this.logger.error(`Erro ao escrever o stream do PDF: ${err.message}`);
          reject(false);
        });
      });
    } catch (error) {
      this.logger.error(`Falha ao gerar o PDF para o projeto "${projectName}". Erro: ${error.message}`, error.stack);
      // Lança uma exceção para que o serviço chamador (ReportsService) saiba que a operação falhou.
      return false;
    }
  }

  private buildPdfHeader(doc: PDFKit.PDFDocument, projectName: string, startDate: Date, endDate: Date): void {
    doc.fontSize(25).text('Relatório de Testes', { align: 'center'});
    doc.moveDown(0.5);
    doc.fontSize(20).text(`Projeto: ${projectName}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(`Período: ${startDate.toLocaleDateString('pt-BR')} a ${endDate.toLocaleDateString('pt-BR')}`);
    doc.moveDown(2);
  }

  private buildPdfBody(doc: PDFKit.PDFDocument, data: ReportData, chartBuffer: Buffer): void {
    // Layout em duas colunas: Gráfico à esquerda, Legenda à direita
    const chartX = doc.page.margins.left;
    const chartY = doc.y;
    const chartWidth = 250;

    doc.image(chartBuffer, chartX, chartY, {
      fit: [chartWidth, chartWidth],
      align: 'center',
      valign: 'center',
    });

    const legendX = chartX + chartWidth + 30;
    const legendY = chartY;

    //doc.fontSize(18).text('Resumo dos Resultados:', legendX, legendY);
    let currentY = legendY + 30;

    const totalTests = Array.from(data.statuses.values()).reduce((sum, current) => sum + current, 0);

    data.statuses.forEach((value, key) => {
      if (value === 0) return; // Pula status com zero ocorrências
      const percentage = totalTests > 0 ? ((value / totalTests) * 100).toFixed(0) : 0;
      const color = this.chartService.statusColors[key] || '#6c757d';

      doc.rect(legendX, currentY, 12, 12).fill(color);
      
      doc.fillColor('black').fontSize(12).text(`${value} ${key} (${percentage}%)`, legendX + 20, currentY);
      
      currentY += 25;
    });
  }

}