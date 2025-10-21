import { IsEnum, IsNotEmpty } from 'class-validator';
import { BugStatus } from '../../config/enums';

export class UpdateBugStatusDto {
  @IsEnum(BugStatus)
  @IsNotEmpty()
  status: BugStatus;
}