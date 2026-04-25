import { 
  Controller, Get, Post, Patch, Delete, Body, Param, 
  UseGuards, UseInterceptors, UploadedFile 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
// import { v4 as uuid } from 'uuid'; // Comentado
// import sharp from 'sharp'; // Comentado
// import * as path from 'path'; // Comentado
// import * as fs from 'fs'; // Comentado

import { ManagementService } from './management.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UploadService } from '../upload/upload.service'; // 🔥 Injetado

@Controller('management')
export class ManagementController {
  constructor(
    private readonly service: ManagementService,
    private readonly uploadService: UploadService, // 🔥 Injetado
  ) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PRESIDENTE)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    let photoUrl = body.photoUrl;

    if (file) {
      // 🔥 Agora usa o Vercel Blob
      photoUrl = await this.uploadService.uploadFile(file, 'management');
    }

    return this.service.create({
      ...body,
      photoUrl,
      isManagement: this.parseBoolean(body.isManagement),
      isSobre: this.parseBoolean(body.isSobre),
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PRESIDENTE)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any
  ) {
    let photoUrl = body.photoUrl;
    
    if (file) {
      // 🔥 Agora usa o Vercel Blob
      photoUrl = await this.uploadService.uploadFile(file, 'management');
    }

    const updateData = { ...body };
    if (photoUrl) updateData.photoUrl = photoUrl;
    if (body.isManagement !== undefined) {
      updateData.isManagement = this.parseBoolean(body.isManagement);
    }
    if (body.isSobre !== undefined) {
      updateData.isSobre = this.parseBoolean(body.isSobre);
    }

    return this.service.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PRESIDENTE)
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  /* 🔥 LÓGICA ANTIGA DE DISCO COMENTADA
  private async saveImage(file: Express.Multer.File) {
    const uploadPath = path.resolve('uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

    const filename = `management-${uuid()}.webp`;
    await sharp(file.buffer)
      .resize(400, 400, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(path.join(uploadPath, filename));

    return `/uploads/${filename}`;
  }
  */

  private parseBoolean(value: unknown): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      return normalized === 'true' || normalized === '1';
    }
    return false;
  }
}