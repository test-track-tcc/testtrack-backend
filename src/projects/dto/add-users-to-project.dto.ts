import { IsUUID, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddUsersToProjectDto {
  @ApiProperty({ description: 'Lista de IDs dos usuários a serem adicionados', type: [String] })
  @IsArray()
  @IsUUID(undefined, { each: true })
  userIds: string[];
}