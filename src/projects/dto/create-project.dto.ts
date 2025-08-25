import { IsString, IsUUID, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ description: 'Nome do projeto', example: 'TestTrack' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Descrição detalhada do projeto', example: 'Ferramenta para gestão de testes automatizados.' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'ID do administrador principal', example: 'f0e9d8c7-b6a5-4321-fedc-ba9876543210' })
  @IsUUID()
  id_admin: string;
}