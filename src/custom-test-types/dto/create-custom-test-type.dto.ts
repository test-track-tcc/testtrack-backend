import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateCustomTestTypeDto {
  @ApiProperty({ example: 'Teste de Regressão Visual' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false, example: 'Testes que comparam screenshots.' })
  @IsString()
  @IsOptional()
  description?: string;
}