import { IsString, IsNotEmpty, IsEnum, IsUUID } from 'class-validator';
import { Priority } from '../../config/enums';

export class CreateBugDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(Priority)
  @IsNotEmpty()
  priority: Priority;

  @IsUUID()
  @IsNotEmpty()
  testCaseId: string;
}