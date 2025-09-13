import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ApiProperty } from '@nestjs/swagger';
import { TestType, Priority, TestCaseStatus } from '../../config/enums';
import { Project } from 'src/projects/entities/project.entity';
import { User } from 'src/users/entities/user.entity';
import { Script } from './script.entity';
import { CustomTestType } from 'src/custom-test-types/entities/custom-test-type.entity';

@Entity('test_cases')
export class TestCase {
  @ApiProperty({ description: 'Unique ID of the test case (UUID)' })
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Title of the test case' })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({ description: 'Detailed description of the test case' })
  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: TestType,
    nullable: true,
  })
  testType: TestType | null;

  @ApiProperty({ description: 'Custom type of the test', type: () => CustomTestType })
  @ManyToOne(() => CustomTestType, (type) => type.testCases, {
    nullable: true,
    eager: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'customTestTypeId' })
  customTestType: CustomTestType | null;


  @ApiProperty({ description: 'Priority of the test case', enum: Priority })
  @Column({ type: 'enum', enum: Priority, default: Priority.MEDIUM })
  priority: Priority;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'responsibleId' })
  responsible: User | null;

  @ManyToOne(() => Project, project => project.testCases, { onDelete: 'CASCADE' })
  project: Project;

  @ApiProperty({ description: 'Unique sequential ID within the project' })
  @Column({ type: 'int' })
  projectSequenceId: number;

  @ApiProperty({ description: 'Estimated time for execution' })
  @Column({ length: 50, nullable: true })
  estimatedTime: string;

  @ApiProperty({ description: 'Time spent on execution' })
  @Column({ length: 50, nullable: true, default: '0m' })
  timeSpent: string;

  @ApiProperty({ description: 'Execution steps' })
  @Column('text')
  steps: string;

  @ApiProperty({ description: 'Expected result' })
  @Column('text')
  expectedResult: string;

  @ApiProperty({ description: 'Linked requirement' })
  @Column({ length: 255, nullable: true })
  taskLink: string;

  @ApiProperty({ description: 'Current status', enum: TestCaseStatus })
  @Column({ type: 'enum', enum: TestCaseStatus, default: TestCaseStatus.PENDING })
  status: TestCaseStatus;

  @ApiProperty({
    description: 'Comentários sobre o caso de teste',
    type: 'string',
    isArray: true,
    example: ['Comentário 1', 'Comentário 2'],
  })
  @Column('json', { nullable: true })
  comments: { idUser: string; comment: string; date: Date }[];

  @ApiProperty({
    description:
      'Anexos relacionados ao caso de teste (URLs ou IDs de arquivos)',
    type: 'string',
    isArray: true,
    example: ['url/anexo1.png', 'id_do_arquivo'],
  })
  @Column('json', { nullable: true })
  attachments: string[];

  @OneToMany(() => Script, script => script.testCase, { cascade: true, eager: true })
  scripts: Script[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  constructor() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}