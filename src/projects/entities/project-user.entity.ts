import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Project } from './project.entity';
import { User } from '../../users/entities/user.entity';

export enum ProjectRole {
  ADMIN = 'admin',
  MEMBER = 'member',
  DEV = 'developer'
}

@Entity('project_users')
export class ProjectUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Project, project => project.projectUsers, { onDelete: 'CASCADE' })
  project: Project;

  @ManyToOne(() => User, user => user.projectUsers, { onDelete: 'CASCADE' })
  user: User;

  @Column({
    type: 'enum',
    enum: ProjectRole,
    default: ProjectRole.MEMBER,
  })
  role: ProjectRole;
}