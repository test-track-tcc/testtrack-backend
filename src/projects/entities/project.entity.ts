import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ApiProperty } from '@nestjs/swagger';

@Entity('projects')
export class Project {s
  @ApiProperty({ description: 'ID único do projeto (UUID)', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Nome do projeto', example: 'TestTrack' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ description: 'Descrição detalhada do projeto', example: 'Ferramenta para gestão de testes automatizados.' })
  @Column('text')
  description: string;

  @ApiProperty({ description: 'ID do administrador principal (UUID)', example: 'f0e9d8c7-b6a5-4321-fedc-ba9876543210' })
  @Column('uuid')
  id_admin: string;

  @ApiProperty({ description: 'Data e hora de criação do projeto', example: '2025-06-09T21:34:52.000Z' })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Data e hora da última atualização do projeto', example: '2025-06-09T22:00:00.000Z' })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  constructor() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}