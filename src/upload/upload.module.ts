import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [UploadService],
})
export class UploadModule {}