import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UploadService } from 'src/upload/upload.service';

@Module({
  imports: [PrismaModule],
  controllers: [PostsController],
  providers: [PostsService, UploadService],
})
export class PostsModule {}