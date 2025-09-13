import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray, IsDate, IsString, IsUUID, ArrayMinSize, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ description: 'Nome da permissão', example: 'Adicionar Usuário', required: true })
  @IsString()
  @IsNotEmpty({ message: 'O nome não pode estar vazio.' })
  name: string;

  @ApiProperty({ description: 'Descrição detalhada da permissão', example: 'Descrição completa sobre a permissão.', required: false, default: "Sem descrição."})
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'ID do usuário responsável (admin) pela permissão', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', required: true })
  @IsUUID()
  @IsNotEmpty({ message: 'O ID do usuário responsável (admin) não pode estar vazio.' })
  createdById: string;

  @ApiProperty({ description: 'ID do projeto associado', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', required: true })
  @IsUUID()
  @IsNotEmpty({ message: 'O ID do projeto associado não pode estar vazio.' })
  projectId: string;
}