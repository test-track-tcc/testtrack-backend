import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  JoinColumn,
  RelationId,
  UpdateDateColumn,
  OneToOne
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AccessGroup } from '../../access-group/entities/access-group.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

@Entity({ name: 'permission' })
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Adicionar Usuário' })
  @Column({ unique: true })
  name: string;

  @ApiProperty()
  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdDate: Date;


  // quem criou a permissão
  @ManyToOne(() => User, (user) => user.createdPermissions, {
    nullable: true,
    onDelete: 'SET NULL', // se o usuário for removido, manter a permissão
    cascade: false,       // NÃO criar/alterar usuário automaticamente
    eager: false,
  })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;


  @ApiProperty({
    description: 'Data e hora da última atualização do caso de teste',
    example: '2025-06-09T22:00:00.000Z',
  })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;


  @ApiProperty({ description: 'ID do projeto da organização associado', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', required: true })
  //@OneToOne(() => Project, (project) => project.permissions, {
  //  nullable: false,
  //  onDelete: 'CASCADE',
  //})
  @IsUUID()
  @IsNotEmpty({ message: 'O ID do projeto associado não pode estar vazio.' })
  projetoId: string;

  
  // se Permission pertence a AccessGroup (ManyToMany)
  @ManyToMany(() => AccessGroup, (group) => group.permissions)
  accessGroups?: AccessGroup[];

}
