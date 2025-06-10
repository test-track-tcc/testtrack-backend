import { IsString, IsEmail, MinLength, MaxLength, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // Importe ApiProperty

export class CreateUserDto {
  @ApiProperty({ description: 'Nome completo do usuário', example: 'Maria Oliveira' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Endereço de e-mail único do usuário', example: 'maria.oliveira@empresa.com' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ description: 'Senha do usuário (mínimo de 8 caracteres)', example: 'MinhaSenhaSegura123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  password: string;

  @ApiProperty({ description: 'Status de ativação do usuário', example: true, required: false, default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}