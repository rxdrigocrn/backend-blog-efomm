import { Global, Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { PrismaModule } from '../prisma/prisma.module';

@Global() 
@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [UploadService],
})
export class UploadModule {}