import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsString, IsUUID, ArrayMinSize, IsOptional } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ description: 'Nome da organização', example: 'TestTrack Organization', required: true })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Descrição detalhada da organização', example: 'Descrição completa sobre a organização.', required: false, default: "Sem descrição."})
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'ID do administrador da organização', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', required: true })
  @IsUUID()
  adminId: string;
}