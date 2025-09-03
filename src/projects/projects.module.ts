import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from './entities/project.entity';
import { Organization } from 'src/organization/entities/organization.entity';
import { User } from '../users/entities/user.entity';
import { ProjectUser } from './entities/project-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Organization, User, ProjectUser])],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}