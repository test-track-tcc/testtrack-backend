import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddUserToOrganizationDto {
  @ApiProperty({ description: 'ID do usuário adicionado à organização', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', required: true })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'ID da organização', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', required: true })
  @IsUUID()
  organizationId: string;
}