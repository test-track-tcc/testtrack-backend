import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToMany, OneToMany } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ApiProperty } from '@nestjs/swagger';
import { Organization } from '../../organization/entities/organization.entity';
import { OrganizationUser } from 'src/organization/entities/organization-user.entity';
import { ProjectUser } from 'src/projects/entities/project-user.entity';
import { Permission } from 'src/permission/entities/permission.entity';
import { AccessGroup } from 'src/access-group/entities/access-group.entity';

@Entity('users')
export class User {
  @ApiProperty({ description: 'ID único do usuário (UUID)', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Nome completo do usuário', example: 'João da Silva' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ description: 'Endereço de e-mail único do usuário', example: 'joao.silva@dominio.com' })
  @Column({ unique: true, length: 255 })
  email: string;

  @ApiProperty({ description: 'Senha criptografada do usuário (não visível diretamente)', readOnly: true })
  @Column({ length: 255 })
  password: string;

  @ApiProperty({ description: 'Status de ativação do usuário', example: true })
  @Column({ default: true })
  active: boolean;

  @ApiProperty({ type: () => [Organization], description: 'Lista de organizações as quais o usuário pertence' })
  @OneToMany(() => OrganizationUser, organizationUser => organizationUser.user)
  organizationUsers: OrganizationUser[];

  @ApiProperty({ type: () => [Organization], description: 'Lista de projetos as quais o usuário pertence' })
  @OneToMany(() => ProjectUser, projectUser => projectUser.user)
  projectUsers: ProjectUser[];  

  // Propriedade para acessar todas as organizações que este usuário administra.
  @OneToMany(() => Organization, organization => organization.admin, {
    eager: false,
    nullable: true,
    cascade: false
  })
  administeredOrganizations: Organization[]; 

  @ApiProperty({ description: 'Indica se é o primeiro acesso do usuário', example: true })
  @Column({ default: true })
  firstAccess: boolean;

  @ApiProperty({ description: 'Data e hora de criação do usuário', example: '2025-06-10T21:00:00.000Z' })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  // lista de permissões criadas por este usuário
  @OneToMany(() => Permission, (p) => p.createdBy)
  createdPermissions?: Permission[];

  // lista de grupos de acesso criados por este usuário
  @OneToMany(() => AccessGroup, (p) => p.createdBy)
  createdAccessGroups?: AccessGroup[];

  // lista de grupos de acesso associados a este usuário
  @ManyToMany(() => AccessGroup, (p) => p.users)
  accessGroups?: AccessGroup[];

  constructor() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}