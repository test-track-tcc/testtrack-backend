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
//import { AccessGroup } from '../../access-group/entities/access-group.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
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


  // quem criou o grupo de acesso
  @ManyToOne(() => User, (user) => user.createdAccessGroups, {
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
