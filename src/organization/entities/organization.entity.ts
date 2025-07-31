import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Nome da organização', example: 'Organização de Testes' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ description: 'Descrição da organização', example: 'Organização criada para controle de Testes' })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({ description: 'Data e hora de criação da organização', example: '2025-06-10T21:00:00.000Z' })
  @CreateDateColumn({ type: 'timestamp' })
  createdDate: Date;

  // @ApiProperty({ description: 'ID do administrador da organização', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  // @Column({ type: 'uuid' })
  // @IsUUID()
  // adminId: string;

  // Relação entre o admin e com várias organizações que administra. Esse código já define a coluna adminId na tabela Organization.
  @ManyToOne(() => User, user => user.administeredOrganizations, {cascade: ["insert" , "update"]})
  @JoinColumn({ name: 'adminId' })
  admin: User;

  // Define a relação de muitos pra muitos entre organizações e usuários.
  @ApiProperty({ type: () => [User], description: 'Lista de usuários que pertencem à organização' })
  @ManyToMany(() => User, user => user.organizations)
  @JoinTable()
  users: User[];
}