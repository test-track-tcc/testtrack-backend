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
  private readonly defaultMargin = 50;
  private readonly defaultFontSize = 10;
  private readonly titleFontSize = 20;
  private readonly subtitleFontSize = 16;
  private readonly headerFontSize = 25;

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
  ): Promise<void> {
    this.logger.log(`Iniciando geração do PDF para o projeto "${projectName}" em "${filePath}"`);

    try {
      const chartBuffer = await this.chartService.createDonutChart(data.statuses);

      await new Promise<void>((resolve, reject) => {
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: this.defaultMargin,
            bottom: this.defaultMargin,
            left: this.defaultMargin,
            right: this.defaultMargin,
          },
          info: {
            Title: `Relatório de Testes - ${projectName}`,
            Author: 'Seu Sistema TestTrack',
          }
        });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);


        this._buildPdfHeader(doc, projectName, startDate, endDate);
        this._addVerticalSpace(doc, 2);
        this._buildPdfBodyWithColumns(doc, data, chartBuffer);

        doc.end();

        stream.on('finish', () => {
          this.logger.log(`PDF salvo com sucesso em "${filePath}"`);
          resolve();
        });
        stream.on('error', (err) => {
          this.logger.error(`Erro ao escrever o stream do PDF: ${err.message}`);
          reject(err);
        });
      });
    } catch (error) {
      this.logger.error(`Falha ao gerar o PDF para o projeto "${projectName}". Erro: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Falha ao gerar o arquivo PDF do relatório.`);
    }
  }

  // =====================================================================
  // Métodos Auxiliares de Construção de Conteúdo (Mantidos e Refinados)
  // =====================================================================

  private _buildPdfHeader(doc: PDFKit.PDFDocument, projectName: string, startDate: Date, endDate: Date): void {
    this._addText(doc, 'Relatório de Testes', this.headerFontSize, 'center');
    this._addVerticalSpace(doc, 0.5);
    this._addText(doc, `Projeto: ${projectName}`, this.titleFontSize, 'center');
    this._addVerticalSpace(doc);
    this._addText(doc, `Período: ${startDate.toLocaleString('pt-BR')} a ${endDate.toLocaleString('pt-BR')}`, this.subtitleFontSize);
  }

  // Renomeado para refletir o uso de colunas
  private _buildPdfBodyWithColumns(doc: PDFKit.PDFDocument, data: ReportData, chartBuffer: Buffer): void {
    const startY = doc.y; // Salva a posição Y antes de começar as colunas

    // Define as funções que irão renderizar o conteúdo de cada coluna
    const renderChartColumn = (columnDoc: PDFKit.PDFDocument) => {
      const chartWidth = columnDoc.page.width / 2 - columnDoc.page.margins.left - 15; // Calcula largura da coluna
      columnDoc.image(chartBuffer, columnDoc.x, columnDoc.y, {
        fit: [chartWidth, chartWidth],
        align: 'center',
        valign: 'center',
      });
    };

    const renderLegendColumn = (columnDoc: PDFKit.PDFDocument) => {
      this._addText(columnDoc, "Resumo dos Resultados:", this.titleFontSize);
      this._addVerticalSpace(columnDoc);
      const startX = columnDoc.x;

      const totalTests = Array.from(data.statuses.values()).reduce((sum, current) => sum + current, 0);

      data.statuses.forEach((value, key) => {
        if (value === 0) return;
        const percentage = totalTests > 0 ? ((value / totalTests) * 100).toFixed(0) : 0;
        const color = this.chartService.statusColors[key] || '#6c757d';
        const currentY = columnDoc.y; // Pega a posição Y atual DENTRO da coluna
        const texto = `${value} ${key} (${percentage}%)`;
        const margemEntreCorETexto = startX + 20;

        columnDoc.rect(startX, currentY, 12, 12).fill(color);
        columnDoc.fillColor('black').fontSize(this.defaultFontSize + 2).text(texto, margemEntreCorETexto, currentY);
        this._addVerticalSpace(columnDoc, 1.5);
      });
    };

    // Chama o helper para criar o layout de duas colunas
    const finalY = this._addTwoColumns(doc, renderChartColumn, renderLegendColumn);

    // Garante que o cursor Y esteja após o elemento mais alto das colunas
    doc.y = finalY;
  }


  //====== Aqui estão os métodos auxiliares para construção do PDF ======//

  /** Desenha uma linha horizontal simples */
  private _addHorizontalLine(doc: PDFKit.PDFDocument, widthPercent: number = 100, color: string = 'grey'): void {
    const availableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const lineWidth = availableWidth * (widthPercent / 100);
    const startX = doc.page.margins.left + (availableWidth - lineWidth) / 2;

    doc.save()
       .strokeColor(color)
       .lineWidth(0.5)
       .moveTo(startX, doc.y)
       .lineTo(startX + lineWidth, doc.y)
       .stroke()
       .restore();
    this._addVerticalSpace(doc, 0.5); // Pequeno espaço após a linha
  }

  /** Adiciona espaço vertical (equivalente a N linhas de texto padrão) */
  private _addVerticalSpace(doc: PDFKit.PDFDocument, lines: number = 1): void {
    doc.moveDown(lines);
  }

  /** Adiciona texto com opções comuns */
  private _addText(
    doc: PDFKit.PDFDocument,
    text: string,
    fontSize: number = this.defaultFontSize,
    align: 'left' | 'center' | 'right' | 'justify' = 'left',
    color: string = 'black',
    otherOptions?: PDFKit.Mixins.TextOptions
  ): void {
    doc.fillColor(color)
       .fontSize(fontSize)
       .text(text, { align, ...otherOptions });
  }

  /**
   * Cria um layout de duas colunas lado a lado.
   * Executa as funções fornecidas para renderizar o conteúdo de cada coluna.
   * Retorna a posição Y final após a coluna mais alta.
   */
  private _addTwoColumns(
    doc: PDFKit.PDFDocument,
    renderLeftColumn: (doc: PDFKit.PDFDocument) => void,
    renderRightColumn: (doc: PDFKit.PDFDocument) => void,
    columnSpacing: number = 30, // Espaço entre as colunas
  ): number {
    const startY = doc.y;
    const availableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const columnWidth = (availableWidth - columnSpacing) / 2;

    const leftColumnX = doc.page.margins.left;
    const rightColumnX = doc.page.margins.left + columnWidth + columnSpacing;

    // Coluna Esquerda
    doc.save(); // Salva estado atual (posição, estilos)
    doc.x = leftColumnX; // Define X inicial
    doc.y = startY; // Define Y inicial
    // Cria sub-página temporária para a coluna
    // Truque que não existe no pdfkit, então controlamos X manualmente
    renderLeftColumn(doc);
    const leftColumnEndY = doc.y; // Guarda onde a coluna esquerda terminou
    doc.restore(); // Restaura estado anterior (cursor volta para antes da coluna)

    // Coluna Direita 
    doc.save();
    doc.x = rightColumnX;
    doc.y = startY; 
    renderRightColumn(doc);
    const rightColumnEndY = doc.y;
    doc.restore();

    // Retorna a posição Y da coluna que terminou mais embaixo
    return Math.max(leftColumnEndY, rightColumnEndY);
  }

}