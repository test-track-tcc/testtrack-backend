import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { UsersModule } from 'src/users/users.module';
import { OrganizationUser } from './entities/organization-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, OrganizationUser]),
    UsersModule
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService],
})
export class OrganizationModule {}
