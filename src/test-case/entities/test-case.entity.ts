import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ApiProperty } from '@nestjs/swagger';
import { TestType, Priority, TestCaseStatus } from '../../config/enums';
import { Project } from 'src/projects/entities/project.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('test_cases')
export class TestCase {
  @ApiProperty({
    description: 'ID único do caso de teste (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Título do caso de teste',
    example: 'Validar login de usuário',
  })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({
    description: 'Descrição detalhada do caso de teste',
    example:
      'Verificar se o usuário consegue logar com credenciais válidas e inválidas.',
  })
  @Column('text')
  description: string;

  @ApiProperty({
    description: 'Tipo do teste',
    enum: TestType,
    example: TestType.FUNCIONAL,
  })
  @Column({ type: 'enum', enum: TestType, default: TestType.MANUAL })
  testType: TestType;

  @ApiProperty({
    description: 'Prioridade do caso de teste',
    enum: Priority,
    example: Priority.HIGH,
  })
  @Column({ type: 'enum', enum: Priority, default: Priority.MEDIUM })
  priority: Priority;

  @ApiProperty({ type: () => User, description: 'Usuário que criou o caso de teste' })
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @ApiProperty({ type: () => User, description: 'Usuário responsável pelo caso de teste' })
  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'responsibleId' })
  responsible: User | null;

  @ApiProperty({ description: 'ID sequencial único dentro do projeto', example: 1 })
  @Column({ type: 'int' })
  projectSequenceId: number;

  @ManyToOne(() => Project, project => project.testCases, { onDelete: 'CASCADE' })
  project: Project;

  @ApiProperty({
    description:
      'Tempo estimado para execução do teste (formato livre, ex: "2h", "30min")',
    example: '1h30m',
  })
  @Column({ length: 50, nullable: true })
  timeEstimated: string;

  @ApiProperty({
    description:
      'Tempo gasto na execução do teste (formato livre, ex: "2h", "30min")',
    example: '1h45m',
  })
  @Column({ length: 50, nullable: true, default: '0m' })
  timeSpent: string;

  @ApiProperty({
    description: 'Passos detalhados para execução do teste',
    example:
      '1. Acessar tela de login; 2. Inserir usuário e senha; 3. Clicar em Logar.',
  })
  @Column('text')
  steps: string;

  @ApiProperty({
    description: 'Resultado esperado do teste',
    example: 'Usuário é redirecionado para a dashboard.',
  })
  @Column('text')
  expectedResult: string;

  @ApiProperty({
    description: 'ID ou descrição do requisito vinculado',
    example: 'REQ-001 - Login de Usuário',
  })
  @Column({ length: 255, nullable: true })
  taskLink: string;

  @ApiProperty({
    description: 'Status atual do caso de teste',
    enum: TestCaseStatus,
    example: TestCaseStatus.PENDING,
  })
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
  attachment: string[];

  @ApiProperty({
    description:
      'Scripts relacionados ao caso de teste (ex: scripts de automação)',
    type: 'string',
    isArray: true,
    example: ['console.log("script de automacao");'],
  })
  @Column('json', { nullable: true })
  scripts: string[];

  @ApiProperty({
    description: 'Data e hora de criação do caso de teste',
    example: '2025-06-09T21:34:52.000Z',
  })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({
    description: 'Data e hora da última atualização do caso de teste',
    example: '2025-06-09T22:00:00.000Z',
  })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  constructor() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}