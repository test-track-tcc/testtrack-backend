import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { CreateProjectDto } from './create-project.dto';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiProperty({ description: 'Novo nome do projeto (opcional)', example: 'TestTrack Plus', required: false })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name?: string;

  @ApiProperty({ description: 'Nova descrição do projeto (opcional)', example: 'Versão aprimorada da ferramenta.', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}