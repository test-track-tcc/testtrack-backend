import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { AccessGroup } from './entities/access-group.entity';
import { AccessGroupController } from './access-group.controller';
import { AccessGroupService } from './access-group.service';
import { Organization } from '../organization/entities/organization.entity';
import { Permission } from '../permission/entities/permission.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccessGroup, Organization, Permission, User]),
    UsersModule
  ],
  controllers: [AccessGroupController],
  providers: [AccessGroupService],
})
export class AccessGroupModule {}
