import { Module } from '@nestjs/common';
import { ManagementService } from './management.service';
import { ManagementController } from './management.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadService } from '../upload/upload.service';
import { UploadModule } from '../upload/upload.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [PrismaModule, UploadModule, AuditLogModule],
  controllers: [ManagementController],
  providers: [ManagementService, UploadService],
})
export class ManagementModule {}