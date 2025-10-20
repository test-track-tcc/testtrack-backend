import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  TEST_CASE_FAILED = 'TEST_CASE_FAILED',
  ORGANIZATION_INVITE = 'ORGANIZATION_INVITE',
  PROJECT_ASSIGNMENT = 'PROJECT_ASSIGNMENT',
  GROUP_ASSIGNMENT = 'GROUP_ASSIGNMENT',
  TEST_CASE_ASSIGNMENT = 'TEST_CASE_ASSIGNMENT',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  link?: string;
}