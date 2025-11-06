import { Entity, PrimaryColumn, Column, OneToMany, JoinTable, ManyToOne, JoinColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ApiProperty } from '@nestjs/swagger';
import { Project } from '../../projects/entities/project.entity';
import { TestCase } from '../../test-case/entities/test-case.entity';

@Entity('test_scenarios')
export class TestScenario {
  @ApiProperty({ description: 'ID único do cenário de teste (UUID)', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @PrimaryColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  identifier: string;

  @ApiProperty({ description: 'Nome/Título do cenário de teste', example: 'Processo de login do usuário' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ description: 'Descrição detalhada do cenário', example: 'Este cenário visa validar o processo de autenticação.' })
  @Column('text')
  description: string;

  @ApiProperty({ description: 'Objetivo do cenário de teste', example: 'Verificar a autenticação com credenciais válidas e inválidas.' })
  @Column('text')
  objective: string;

  @ApiProperty({ description: 'Requisitos relacionados ao cenário', isArray: true, example: ['RF-001', 'RF-002'] })
  @Column('json', { nullable: true })
  relatedRequirements: string[];

  @ApiProperty({ description: 'Pré-condições para a execução do cenário', example: 'Usuário deve estar cadastrado no sistema.' })
  @Column('text', { nullable: true })
  preconditions: string;

  @ApiProperty({ description: 'Critérios de aceitação para o cenário', example: 'O usuário deve ser redirecionado para o dashboard após o login.' })
  @Column('text', { nullable: true })
  acceptanceCriteria: string;

  @ManyToOne(() => Project, (project) => project.testScenarios)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @ApiProperty({ description: 'ID do projeto ao qual o cenário de teste pertence', example: 'uuid-do-projeto' })
  @Column('uuid')
  projectId: string;

  @OneToMany(() => TestCase, (testCase) => testCase.testScenario)
  testCases: TestCase[];

  constructor() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}