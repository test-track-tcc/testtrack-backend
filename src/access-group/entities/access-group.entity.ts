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
import { ApiProperty } from '@nestjs/swagger';
import { Permission } from 'src/permission/entities/permission.entity';
import { Organization } from 'src/organization/entities/organization.entity';

@Entity({ name: 'access_group' })
export class AccessGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Devs e estagiários' })
  @Column({ unique: true })
  name: string;

  @ApiProperty()
  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdDate: Date;


  @ManyToOne(() => User, (user) => user.createdAccessGroups, {
    nullable: true,
    onDelete: 'SET NULL',
    cascade: false,
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


  // Grupos de acessos podem ter várias permissões
  @ManyToMany(() => Permission, p => p.accessGroups, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  permissions: Permission[];


  // Grupo pertence a 1 organização
  @ManyToOne(() => Organization, org => org.accessGroups, {
    onDelete: 'CASCADE', // se deletar org, pode opcionalmente remover grupos
    nullable: false,
  })
  organization: Organization;

  // lista de usuários associados a este grupo de acesso
  @ManyToMany(() => User, user => user.accessGroups)
  @JoinTable()
  users: User[];
}
