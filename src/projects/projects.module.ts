import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from './entities/project.entity';
import { Organization } from 'src/organization/entities/organization.entity';
import { User } from '../users/entities/user.entity';
import { ProjectUser } from './entities/project-user.entity';
import { Permission } from 'src/permission/entities/permission.entity';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Organization, User, ProjectUser, Permission]),
  NotificationModule
],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}