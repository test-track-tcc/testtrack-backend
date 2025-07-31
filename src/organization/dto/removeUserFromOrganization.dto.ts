import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class RemoveUserFromOrganizationDto {
  @ApiProperty({ description: 'ID do usuário a ser removido da organização', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', required: true })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'ID da organização', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', required: true })
  @IsUUID()
  @IsNotEmpty()
  organizationId: string;
}