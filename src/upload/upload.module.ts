import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [UploadService],
})
export class UploadModule {}