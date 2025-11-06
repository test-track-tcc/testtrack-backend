import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestScenario } from './entities/test-scenario.entity';
import { TestScenarioService } from './test-scenario.service';
import { TestScenarioController } from './test-scenario.controller';
import { TestCase } from '../test-case/entities/test-case.entity';
import { Project } from '../projects/entities/project.entity'; 

@Module({
  imports: [TypeOrmModule.forFeature([TestScenario, TestCase, Project])], 
  providers: [TestScenarioService],
  controllers: [TestScenarioController],
})
export class TestScenarioModule {}