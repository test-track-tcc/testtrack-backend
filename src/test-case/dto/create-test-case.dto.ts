import { IsString, IsEnum, IsUUID, IsOptional, IsBoolean, IsArray, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TipoTeste, Prioridade, StatusCasoTeste } from '../../config/enums';

export class CreateTestCaseDto {
  @ApiProperty({ description: 'Título do caso de teste', example: 'Validar funcionalidade X' })
  @IsString()
  titulo: string;

  @ApiProperty({ description: 'Descrição detalhada do caso de teste', example: 'Descrição completa dos passos e contexto.' })
  @IsString()
  descricao: string;

  @ApiProperty({ description: 'Tipo do teste', enum: TipoTeste, example: TipoTeste.FUNCTIONAL })
  @IsEnum(TipoTeste)
  tipoTeste: TipoTeste;

  @ApiProperty({ description: 'Prioridade do caso de teste', enum: Prioridade, example: Prioridade.HIGH })
  @IsEnum(Prioridade)
  prioridade: Prioridade;

  @ApiProperty({ description: 'ID do usuário que está criando o caso de teste', example: 'f0e9d8c7-b6a5-4321-fedc-ba9876543210' })
  @IsUUID()
  id_userCriacao: string;

  @ApiProperty({ description: 'ID do usuário responsável pelo caso de teste', example: '12345678-90ab-cdef-1234-567890abcdef12', required: false })
  @IsOptional()
  @IsUUID()
  idResponsavel?: string;

  @ApiProperty({ description: 'Tempo estimado para execução (ex: "1h30m")', example: '1h30m', required: false })
  @IsOptional()
  @IsString()
  tempoEstimado?: string;

  @ApiProperty({ description: 'Passos detalhados para execução do teste', example: '1. Fazer A; 2. Fazer B; 3. Verificar C.' })
  @IsString()
  steps: string;

  @ApiProperty({ description: 'Resultado esperado do teste', example: 'A funcionalidade X funciona conforme esperado.' })
  @IsString()
  resultadoEsperado: string;

  @ApiProperty({ description: 'ID ou descrição do requisito vinculado', example: 'REQ-005', required: false })
  @IsOptional()
  @IsString()
  requisitoVinculado?: string;

  @ApiProperty({ description: 'Status inicial do caso de teste', enum: StatusCasoTeste, example: StatusCasoTeste.PENDING, required: false, default: StatusCasoTeste.PENDING })
  @IsOptional()
  @IsEnum(StatusCasoTeste)
  status?: StatusCasoTeste;

  @ApiProperty({
    description: 'Lista de comentários no formato {idUsuario, comentario, data}',
    type: Object,
    isArray: true,
    example: [{ idUsuario: 'uuid', comentario: 'Observação inicial', data: '2025-06-09T21:34:52.000Z' }],
    required: false
  })
  @IsOptional()
  @IsArray()
  comentarios?: { idUsuario: string; comentario: string; data: Date }[];

  @ApiProperty({ description: 'URLs ou IDs de anexos', type: String, isArray: true, example: ['http://example.com/image.png'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  anexos?: string[];

  @ApiProperty({ description: 'Scripts relacionados ao teste', type: 'string', isArray: true, example: ['console.log("automação");'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scripts?: string[];
}