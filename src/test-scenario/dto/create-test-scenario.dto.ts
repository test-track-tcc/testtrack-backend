import { IsString, IsNotEmpty, IsOptional, IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTestScenarioDto {
  @ApiProperty({ description: 'Nome do cenário de teste' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Descrição do cenário' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Objetivo do cenário' })
  @IsString()
  @IsNotEmpty()
  objective: string;

  @ApiProperty({ description: 'Requisitos relacionados', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedRequirements?: string[];

  @ApiProperty({ description: 'Pré-condições', required: false })
  @IsOptional()
  @IsString()
  preconditions?: string;

  @ApiProperty({ description: 'Critérios de aceitação', required: false })
  @IsOptional()
  @IsString()
  acceptanceCriteria?: string;

  @ApiProperty({ description: 'ID do projeto' })
  @IsUUID()
  @IsNotEmpty()
  projectId: string;
  
  @ApiProperty({ description: 'IDs dos casos de teste associados', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  testCaseIds?: string[];
}