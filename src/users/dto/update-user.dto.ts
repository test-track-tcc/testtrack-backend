import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsEmail, IsBoolean, IsOptional } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ description: 'Novo nome completo do usuário (opcional)', example: 'Maria Oliveira Atualizada', required: false })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name?: string;

  @ApiProperty({ description: 'Novo endereço de e-mail único do usuário (opcional)', example: 'novo.email@empresa.com', required: false })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiProperty({ description: 'Nova senha do usuário (opcional, será criptografada)', example: 'NovaSenhaForte456!', required: false })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  password?: string;

  @ApiProperty({ description: 'Novo status de ativação do usuário (opcional)', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}