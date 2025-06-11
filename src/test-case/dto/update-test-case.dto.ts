import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StatusCasoTeste } from '../../config/enums';

export class UpdateTestCaseStatusDto {
  @ApiProperty({ description: 'Novo status do caso de teste', enum: StatusCasoTeste, example: StatusCasoTeste.APPROVED })
  @IsEnum(StatusCasoTeste)
  newStatus: StatusCasoTeste;

  @ApiProperty({ description: 'Comentário opcional sobre a mudança de status', example: 'Teste aprovado após correção do bug.', required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}