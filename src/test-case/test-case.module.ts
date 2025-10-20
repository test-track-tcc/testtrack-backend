import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestCasesService } from './test-case.service';
import { TestCasesController } from './test-case.controller';
import { TestCase } from './entities/test-case.entity';
import { Script } from './entities/script.entity';
import { Project } from 'src/projects/entities/project.entity';
import { User } from 'src/users/entities/user.entity';
import { CustomTestType } from 'src/custom-test-types/entities/custom-test-type.entity';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([TestCase, Script, Project, User, CustomTestType]),
  NotificationModule
],
  providers: [TestCasesService],
  controllers: [TestCasesController],
})
export class TestCasesModule {}