import { Controller, Post, Body, Param, UseInterceptors, UploadedFiles, ParseUUIDPipe } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('comments')
@Controller('test-cases/:testCaseId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        authorId: { type: 'string', format: 'uuid' },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  create(
    @Param('testCaseId', ParseUUIDPipe) testCaseId: string,
    @Body() createCommentDto: CreateCommentDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.commentService.create(testCaseId, createCommentDto, files);
  }
}
