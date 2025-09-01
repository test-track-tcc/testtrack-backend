import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray, IsDate, IsString, IsUUID, ArrayMinSize, IsOptional } from 'class-validator';

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

  // Ainda não habilitado por falta de implementação (devo juntar com a parte do diogo)
  //@ApiProperty({ description: 'ID do projeto associado', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', required: true })
  //@IsUUID()
  //@IsNotEmpty({ message: 'O ID do projeto associado não pode estar vazio.' })
  //projectId: string;
}