import { PartialType } from '@nestjs/swagger';
import { CreateCustomTestTypeDto } from './create-custom-test-type.dto';

export class UpdateCustomTestTypeDto extends PartialType(
  CreateCustomTestTypeDto,
) {}