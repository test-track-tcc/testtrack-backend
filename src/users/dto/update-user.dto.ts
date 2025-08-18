import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsEmail, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ description: 'Novo nome completo do usuário (opcional)', example: 'Maria Oliveira Atualizada', required: false })
  @IsOptional()
  @IsNotEmpty({ message: 'O nome não pode ser vazio.' })
  @IsString({ message: 'O nome deve ser uma string.' })
  @MinLength(3, { message: 'O nome deve ter no mínimo 3 caracteres.' })
  @MaxLength(255, { message: 'O nome deve ter no máximo 255 caracteres.' })
  name?: string;

  @ApiProperty({ description: 'Novo endereço de e-mail único do usuário (opcional)', example: 'novo.email@empresa.com', required: false })
  @IsOptional()
  @IsNotEmpty({ message: 'O email não pode ser vazio.' })
  @IsEmail({}, { message: 'O email informado não é válido.' })
  @MaxLength(255, { message: 'O email deve ter no máximo 255 caracteres.' })
  email?: string;

  @ApiProperty({ description: 'Nova senha do usuário (opcional, será criptografada)', example: 'NovaSenhaForte456!', required: false })
  @IsOptional()
  @IsNotEmpty({ message: 'A senha não pode ser vazia.' })
  @IsString({ message: 'A senha deve ser uma string.' })
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres.' })
  @MaxLength(255, { message: 'A senha deve ter no máximo 255 caracteres.' })
  password?: string;

  @ApiProperty({ description: 'Novo status de ativação do usuário (opcional)', example: false, required: false })
  @IsOptional()
  @IsBoolean({ message: 'O campo "active" deve ser um booleano.' })
  active?: boolean;
}