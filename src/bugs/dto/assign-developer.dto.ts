import { IsUUID, IsNotEmpty } from 'class-validator';

export class AssignDeveloperDto {
  @IsUUID()
  @IsNotEmpty()
  developerId: string;
}