import { IsString, IsUUID, IsNotEmpty, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { projectStatus } from 'src/enum/projectStatus';

export class CreateProjectDto {
  @ApiProperty({ description: 'Nome do projeto' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Descrição do projeto', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'ID da organização à qual o projeto pertence' })
  @IsUUID()
  @IsNotEmpty()
  organizationId: string;

  @ApiProperty({ description: 'ID do usuário que está criando o projeto (owner)' })
  @IsUUID()
  @IsNotEmpty()
  ownerId: string;

  @ApiProperty({ description: 'Data de início do projeto', example: '2025-01-01', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiProperty({ description: 'Previsão de finalização do projeto', example: '2025-12-31', required: false })
  @IsOptional()
  @IsDateString()
  estimateDate?: Date;

  @ApiProperty({ description: 'Data de conclusão do projeto', example: '2025-12-15', required: false })
  @IsOptional()
  @IsDateString()
  conclusionDate?: Date

  @ApiProperty({
    description: 'Status inicial do projeto',
    enum: projectStatus,
    example: projectStatus.NOT_STARTED,
    required: false,
    default: projectStatus.NOT_STARTED
  })
  @IsOptional()
  @IsEnum(projectStatus)
  status?: projectStatus;
}