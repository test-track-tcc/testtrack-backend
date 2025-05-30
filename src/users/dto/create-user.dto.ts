import { IsString, IsEmail, MinLength, MaxLength, IsBoolean, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(8) // Senhas devem ter um mínimo de caracteres
  @MaxLength(255)
  password: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}