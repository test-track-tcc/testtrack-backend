import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AddUserToGroupDto {
  @ApiProperty({
    description: 'ID do usuário a ser adicionado ao grupo.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    required: true
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'ID do grupo ao qual o usuário será adicionado.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    required: true
  })
  @IsNotEmpty()
  @IsUUID()
  groupId: string;
}