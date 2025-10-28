import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TestCase } from '../../test-case/entities/test-case.entity';
import { ApiProperty } from '@nestjs/swagger';


@Entity('comments')
export class Comment {
  @ApiProperty({ description: 'ID único do comentário' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Conteúdo do comentário' })
  @Column('text')
  text: string;

  @ApiProperty({ description: 'Autor do comentário' })
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @ManyToOne(() => TestCase, (testCase) => testCase.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'testCaseId' })
  testCase: TestCase;

  @ApiProperty({ description: 'Anexos do comentário (URLs das imagens)' })
  @Column('json', { nullable: true })
  attachments: string[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}