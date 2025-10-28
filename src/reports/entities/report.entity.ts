import { Project } from 'src/projects/entities/project.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fileName: string;

  @Column()
  filePath: string;

  @CreateDateColumn({ type: 'timestamp' })
  generatedAt: Date;

  @ManyToOne(() => Project, (project) => project.reports, { eager: true })
  @JoinColumn({ name: 'projectId' })
  project: Project;
}