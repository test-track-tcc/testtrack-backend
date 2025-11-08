import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { TestCase } from '../test-case/entities/test-case.entity';
import { User } from '../users/entities/user.entity';
import { put } from '@vercel/blob';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(TestCase)
    private testCaseRepository: Repository<TestCase>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    testCaseId: string,
    createCommentDto: CreateCommentDto,
    files: Express.Multer.File[],
  ): Promise<Comment> {
    const { text, authorId } = createCommentDto;

    const testCase = await this.testCaseRepository.findOneBy({ id: testCaseId });
    if (!testCase) throw new NotFoundException(`Caso de teste com ID "${testCaseId}" não encontrado.`);

    const author = await this.userRepository.findOneBy({ id: authorId });
    if (!author) throw new NotFoundException(`Usuário com ID "${authorId}" não encontrado.`);

    const attachments: string[] = [];
    for (const file of files) {
      const blobName = `comments/${Date.now()}-${file.originalname}`;
      const { url } = await put(blobName, file.buffer, {
        access: 'public',
        token: process.env.TESTTRACK_READ_WRITE_TOKEN,
      });
      attachments.push(url);
    }

    const newComment = this.commentRepository.create({
      text,
      author,
      testCase,
      attachments,
    });

    return this.commentRepository.save(newComment);
  }
}
