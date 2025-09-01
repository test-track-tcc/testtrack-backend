import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { AccessGroup } from './entities/access-group.entity';
import { AccessGroupController } from './access-group.controller';
import { AccessGroupService } from './access-group.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccessGroup]),
    UsersModule
  ],
  controllers: [AccessGroupController],
  providers: [AccessGroupService],
})
export class AccessGroupModule {}
