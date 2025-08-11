import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Endereço de e-mail do usuário',
    example: 'seu-email@teste.com',
  })
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'SuaSenha@123',
  })
  password: string;
}