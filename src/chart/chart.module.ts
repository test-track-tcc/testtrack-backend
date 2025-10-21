import { Module } from '@nestjs/common';
import { ChartService } from './chart.service';

@Module({
  providers: [ChartService],
  exports: [ChartService], // Exporta o serviço para que outros módulos possam usá-lo
})
export class ChartModule {}