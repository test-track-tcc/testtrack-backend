import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  UpdateDateColumn
} from 'typeorm';
import { TestCase } from './test-case.entity';
import { ApiProperty } from '@nestjs/swagger';
import { TestCaseStatus } from 'src/config/enums';

@Entity('scripts')
export class Script {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Path or name of the script file',
    example: 'path/to/script.js',
  })
  @Column()
  scriptPath: string;

  @ApiProperty({ description: 'Version of the script', example: 1 })
  @Column()
  version: number;

  @ApiProperty({ 
    description: 'Status do TestCase associado no momento da criação/atualização deste script', 
    enum: TestCaseStatus, 
    example: TestCaseStatus.PENDING 
  })
  @Column({ type: 'enum', enum: TestCaseStatus, nullable: true })
  status: TestCaseStatus | null;

  @ApiProperty({ description: 'Data e hora em que o status foi definido para este script' })
  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  statusSetAt: Date | null;

  @ApiProperty({ description: 'Creation date of the script version' })
  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => TestCase, (testCase) => testCase.scripts)
  testCase: TestCase;
}