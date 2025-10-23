import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestCase } from '../test-case/entities/test-case.entity';
import { Bug } from '../bugs/entities/bug.entity';
import { ChartsService } from './charts.service';
import { ChartsController } from './charts.controller'; // Importar o controller

@Module({
  imports: [TypeOrmModule.forFeature([TestCase, Bug])],
  providers: [ChartsService],
  controllers: [ChartsController],
  exports: [ChartsService],
})
export class ChartsModule {}