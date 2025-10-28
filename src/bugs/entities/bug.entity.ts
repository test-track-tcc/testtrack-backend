import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Priority, BugStatus } from '../../config/enums';
import { TestCase } from '../../test-case/entities/test-case.entity';
import { User } from '../../users/entities/user.entity';

@Entity('bugs')
export class Bug {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: BugStatus,
    default: BugStatus.OPEN,
  })
  status: BugStatus;

  @Column({
    type: 'enum',
    enum: Priority,
    default: Priority.NONE,
  })
  priority: Priority;

  @Column({ type: 'uuid' })
  testCaseId: string;

  @ManyToOne(() => TestCase)
  @JoinColumn({ name: 'testCaseId' })
  testCase: TestCase;

  @Column({ type: 'uuid', nullable: true })
  assignedDeveloperId: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assignedDeveloperId' })
  assignedDeveloper: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}