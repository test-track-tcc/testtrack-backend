import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class DeletePermissionDto {
  @ApiProperty({ description: 'ID da permissão a ser removida do grupo de acesso', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', required: true })
  @IsUUID()
  @IsNotEmpty()
  permissionId: string;
}