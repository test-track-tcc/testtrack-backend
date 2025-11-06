import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Script } from '../test-case/entities/script.entity';
import { ScriptsService } from './scripts.service';
import { ScriptsController } from './scripts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Script])],
  providers: [ScriptsService],
  controllers: [ScriptsController],
})
export class ScriptsModule {}