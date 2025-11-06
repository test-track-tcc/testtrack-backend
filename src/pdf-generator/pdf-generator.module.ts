import { Module } from '@nestjs/common';
import { PdfGeneratorService } from './pdf-generator.service';
import { ChartModule } from '../chart/chart.module';

@Module({
  imports: [ChartModule], // Importa o ChartModule para ter acesso ao ChartService
  providers: [PdfGeneratorService],
  exports: [PdfGeneratorService], // Exporta o serviço para que outros módulos possam usá-lo
})
export class PdfGeneratorModule {}