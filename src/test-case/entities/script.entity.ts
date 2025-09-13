import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { TestCase } from './test-case.entity';
import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ description: 'Creation date of the script version' })
  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => TestCase, (testCase) => testCase.scripts)
  testCase: TestCase;
}