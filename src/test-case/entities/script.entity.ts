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
    description: 'Caminho ou nome do arquivo de script',
    example: 'path/to/script.js',
  })
  @Column()
  scriptPath: string;

  @ApiProperty({ description: 'Versão do script', example: 1 })
  @Column()
  version: number;

  @ApiProperty({ description: 'Data de criação da versão do script' })
  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => TestCase, (testCase) => testCase.scripts)
  testCase: TestCase;
}