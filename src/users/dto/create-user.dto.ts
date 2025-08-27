import { IsString, IsEmail, MinLength, MaxLength, IsBoolean, IsOptional, IsNotEmpty,  } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Nome completo do usuário', example: 'Maria Oliveira' })
  @IsNotEmpty({ message: 'O nome não pode ser vazio.' })
  @IsString({ message: 'O nome deve ser uma string.' })
  @MinLength(3, { message: 'O nome deve ter no mínimo 3 caracteres.' })
  @MaxLength(255, { message: 'O nome deve ter no máximo 255 caracteres.' })
  name: string;

  @ApiProperty({ description: 'Endereço de e-mail único do usuário', example: 'maria.oliveira@empresa.com' })
  @IsNotEmpty({ message: 'O email não pode ser vazio.' })
  @IsEmail({}, { message: 'O email informado não é válido.' })
  @MaxLength(255, { message: 'O email deve ter no máximo 255 caracteres.' })
  email: string;

  @ApiProperty({ description: 'Senha do usuário (mínimo de 8 caracteres)', example: 'MinhaSenhaSegura123!' })
  @IsNotEmpty({ message: 'A senha não pode ser vazia.' })
  @IsString({ message: 'A senha deve ser uma string.' })
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres.' })
  @MaxLength(255, { message: 'A senha deve ter no máximo 255 caracteres.' })
  password: string;

  @ApiProperty({ description: 'Status de ativação do usuário', example: true, required: false, default: true })
  @IsOptional()
  @IsBoolean({ message: 'O campo "active" deve ser um booleano.' })
  active?: boolean;
}