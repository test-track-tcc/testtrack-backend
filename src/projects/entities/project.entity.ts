import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/users/entities/user.entity';
import { Organization } from 'src/organization/entities/organization.entity';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectUser } from './project-user.entity';
import { projectStatus } from 'src/enum/projectStatus';

@Entity('projects')
export class Project {
  @ApiProperty({ description: 'ID único do projeto (UUID)', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Nome do projeto', example: 'TestTrack' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ description: 'Descrição detalhada do projeto', example: 'Ferramenta para gestão de testes automatizados.' })
  @Column('text')
  description: string;

  @ApiProperty({ type: () => User, description: 'O usuário que é dono do projeto' })
  @ManyToOne(() => User)
  owner: User;

  @OneToMany(() => ProjectUser, projectUser => projectUser.project, { cascade: true })
  projectUsers: ProjectUser[];

  @ManyToOne(() => Organization, organization => organization.projects)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @ApiProperty({ description: 'Data de início do projeto', example: '2025-01-01' })
  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @ApiProperty({ description: 'Previsão de finalização do projeto', example: '2025-12-31' })
  @Column({ type: 'date', nullable: true })
  estimateEnd: Date;

  @ApiProperty({ description: 'Data de conclusão do projeto', example: '2025-12-15' })
  @Column({ type: 'date', nullable: true })
  conclusionDate: Date;

  @ApiProperty({
    description: 'Status atual do projeto',
    enum: projectStatus,
    example: projectStatus.IN_PROGRESS,
  })
  @Column({ type: 'enum', enum: projectStatus, default: projectStatus.NOT_STARTED })
  status: projectStatus;

  @ApiProperty({ description: 'Data e hora de criação do projeto', example: '2025-06-09T21:34:52.000Z' })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Data e hora da última atualização do projeto', example: '2025-06-09T22:00:00.000Z' })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  constructor() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}