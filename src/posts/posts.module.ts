import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadService } from '../upload/upload.service';
import { UploadModule } from '../upload/upload.module';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';

@Module({
  imports: [PrismaModule, UploadModule],
  controllers: [PostsController, LikesController],
  providers: [PostsService, UploadService, LikesService],
})
export class PostsModule {}