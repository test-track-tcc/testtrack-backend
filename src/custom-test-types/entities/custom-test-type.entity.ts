import { Organization } from 'src/organization/entities/organization.entity';
import { TestCase } from 'src/test-case/entities/test-case.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('custom_test_types')
@Unique(['name', 'organization']) // Garante que o nome seja único por projeto
export class CustomTestType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;


  @ManyToOne(() => Organization, (organization) => organization.customTestTypes, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  organization: Organization;


  @OneToMany(() => TestCase, (testCase) => testCase.customTestType)
  testCases: TestCase[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}