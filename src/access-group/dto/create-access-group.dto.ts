import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray, IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateAccessGroupDto {
  @ApiProperty({ description: 'Nome do grupo de acesso', example: 'Desenvolvedores', required: true })
  @IsString()
  @IsNotEmpty({ message: 'O nome não pode estar vazio.' })
  name: string;

  @ApiProperty({ description: 'Descrição detalhada do grupo de acesso', example: 'Descrição completa sobre o grupo de acesso.', required: false, default: "Sem descrição."})
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'ID do usuário responsável (admin) pela permissão', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', required: true })
  @IsUUID()
  @IsNotEmpty({ message: 'O ID do usuário responsável (admin) não pode estar vazio.' })
  createdById: string;

  @ApiProperty({ description: 'ID da organização à qual o grupo de acesso pertence', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', required: true })
  @IsUUID()
  @IsNotEmpty({ message: 'O ID da organização não pode estar vazio.' })
  organizationId: string;

  @ApiProperty({
    description: 'Lista de IDs de permissões a serem associadas ao grupo',
    example: ['bf06482c-2d10-4d2b-9714-252b8a57bd68'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'As permissões devem ser uma lista de IDs.' })
  @IsUUID('4', { each: true, message: 'Cada ID de permissão deve ser um UUID válido.' })
  permissionIds?: string[];
}