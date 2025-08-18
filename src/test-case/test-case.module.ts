import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestCasesService } from './test-case.service';
import { TestCasesController } from './test-case.controller';
import { TestCase } from './entities/test-case.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TestCase])],
  providers: [TestCasesService],
  controllers: [TestCasesController],
})
export class TestCasesModule {}