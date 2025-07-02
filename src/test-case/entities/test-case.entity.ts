import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ApiProperty } from '@nestjs/swagger';
import { TipoTeste, Prioridade, StatusCasoTeste } from '../../config/enums'; // Importe os enums

@Entity('test_cases')
export class TestCase {
  @ApiProperty({ description: 'ID único do caso de teste (UUID)', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Título do caso de teste', example: 'Validar login de usuário' })
  @Column({ length: 255 })
  titulo: string;

  @ApiProperty({ description: 'Descrição detalhada do caso de teste', example: 'Verificar se o usuário consegue logar com credenciais válidas e inválidas.' })
  @Column('text')
  descricao: string;

  @ApiProperty({
    description: 'Tipo do teste',
    enum: TipoTeste,
    example: TipoTeste.FUNCTIONAL,
  })
  @Column({ type: 'enum', enum: TipoTeste, default: TipoTeste.MANUAL })
  tipoTeste: TipoTeste;

  @ApiProperty({
    description: 'Prioridade do caso de teste',
    enum: Prioridade,
    example: Prioridade.HIGH,
  })
  @Column({ type: 'enum', enum: Prioridade, default: Prioridade.MEDIUM })
  prioridade: Prioridade;

  @ApiProperty({ description: 'ID do usuário que criou o caso de teste (UUID)', example: 'f0e9d8c7-b6a5-4321-fedc-ba9876543210' })
  @Column('uuid')
  id_userCriacao: string;

  @ApiProperty({ description: 'ID do usuário responsável pelo caso de teste (UUID)', example: '12345678-90ab-cdef-1234-567890abcdef12' })
  @Column('uuid', { nullable: true })
  idResponsavel: string;

  @ApiProperty({ description: 'Tempo estimado para execução do teste (formato livre, ex: "2h", "30min")', example: '1h30m' })
  @Column({ length: 50, nullable: true })
  tempoEstimado: string;

  @ApiProperty({ description: 'Tempo gasto na execução do teste (formato livre, ex: "2h", "30min")', example: '1h45m' })
  @Column({ length: 50, nullable: true, default: '0m' })
  tempoGasto: string;

  @ApiProperty({ description: 'Passos detalhados para execução do teste', example: '1. Acessar tela de login; 2. Inserir usuário e senha; 3. Clicar em Logar.' })
  @Column('text')
  steps: string;

  @ApiProperty({ description: 'Resultado esperado do teste', example: 'Usuário é redirecionado para a dashboard.' })
  @Column('text')
  resultadoEsperado: string;

  @ApiProperty({ description: 'ID ou descrição do requisito vinculado', example: 'REQ-001 - Login de Usuário' })
  @Column({ length: 255, nullable: true })
  requisitoVinculado: string;

  @ApiProperty({
    description: 'Status atual do caso de teste',
    enum: StatusCasoTeste,
    example: StatusCasoTeste.PENDING,
  })
  @Column({ type: 'enum', enum: StatusCasoTeste, default: StatusCasoTeste.PENDING })
  status: StatusCasoTeste;

  @ApiProperty({ description: 'Comentários sobre o caso de teste', type: 'string', isArray: true, example: ['Comentário 1', 'Comentário 2'] })
  @Column('json', { nullable: true })
  comentarios: { idUsuario: string; comentario: string; data: Date }[];

  @ApiProperty({ description: 'Anexos relacionados ao caso de teste (URLs ou IDs de arquivos)', type: 'string', isArray: true, example: ['url/anexo1.png', 'id_do_arquivo'] })
  @Column('json', { nullable: true })
  anexos: string[];

  @ApiProperty({ description: 'Scripts relacionados ao caso de teste (ex: scripts de automação)', type: 'string', isArray: true, example: ['console.log("script de automacao");'] })
  @Column('json', { nullable: true })
  scripts: string[];

  @ApiProperty({ description: 'Data e hora de criação do caso de teste', example: '2025-06-09T21:34:52.000Z' })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Data e hora da última atualização do caso de teste', example: '2025-06-09T22:00:00.000Z' })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  constructor() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}