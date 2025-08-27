import { IsString, IsEnum, IsUUID, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CommentDto {
  @ApiProperty({ description: 'ID do usuário que fez o comentário', format: 'uuid', example: 'uuid_do_usuario' })
  @IsUUID()
  idUsuario: string;

  @ApiProperty({ description: 'Conteúdo do comentário', example: 'Observação importante.' })
  @IsString()
  comentario: string;

  @ApiProperty({ description: 'Data e hora do comentário', type: 'string', format: 'date-time', example: '2025-06-09T21:34:52.000Z' })
  @IsString()
  data: string;
}