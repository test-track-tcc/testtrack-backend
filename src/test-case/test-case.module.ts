import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestCasesService } from './test-case.service';
import { TestCasesController } from './test-case.controller';
import { TestCase } from './entities/test-case.entity';
import { Script } from './entities/script.entity';
import { Project } from '../projects/entities/project.entity';
import { User } from '../users/entities/user.entity';
import { CustomTestType } from '../custom-test-types/entities/custom-test-type.entity';
import { NotificationModule } from '../notification/notification.module';
import { BugsModule } from '../bugs/bugs.module';

@Module({
  imports: [TypeOrmModule.forFeature([TestCase, Script, Project, User, CustomTestType]),
  BugsModule,
  NotificationModule
],
  providers: [TestCasesService],
  controllers: [TestCasesController],
})
export class TestCasesModule {}