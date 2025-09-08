import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestCasesService } from './test-case.service';
import { TestCasesController } from './test-case.controller';
import { TestCase } from './entities/test-case.entity';
import { Project } from 'src/projects/entities/project.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    TestCase,
    Project,
    User 
  ])],
  providers: [TestCasesService],
  controllers: [TestCasesController],
})
export class TestCasesModule {}