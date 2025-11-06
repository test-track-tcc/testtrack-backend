import { Module } from '@nestjs/common';
import { CustomTestTypesService } from './custom-test-type.service';
import { CustomTestTypesController } from './custom-test-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomTestType } from './entities/custom-test-type.entity';

import { Organization } from '../organization/entities/organization.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomTestType, Organization])],
  controllers: [CustomTestTypesController],
  providers: [CustomTestTypesService],
})
export class CustomTestTypesModule {}