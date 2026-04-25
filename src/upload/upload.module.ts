import { Global, Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [UploadService],
  exports: [UploadService], // 👈 FALTOU ISSO
})
export class UploadModule {}