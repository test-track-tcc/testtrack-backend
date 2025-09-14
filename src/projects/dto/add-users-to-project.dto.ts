import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddUserToProjectDto {
  @ApiProperty({ description: 'ID do utilizador a ser adicionado ao projeto' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}