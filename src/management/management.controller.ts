import { 
  Controller, Get, Post, Patch, Delete, Body, Param, 
  UseGuards, UseInterceptors, UploadedFile 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';

import { ManagementService } from './management.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('management')
export class ManagementController {
  constructor(private readonly service: ManagementService) {}

  // ✅ Rota Pública para a Landing Page
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // 🔥 Rota Protegida para Criar
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PRESIDENTE)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    let photoUrl = body.photoUrl;

    if (file) {
      photoUrl = await this.saveImage(file);
    }

    return this.service.create({
      ...body,
      photoUrl,
      isManagement: this.parseBoolean(body.isManagement),
      isSobre: this.parseBoolean(body.isSobre),
    });
  }

  // 🔥 Rota Protegida para Editar
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
    if (file) photoUrl = await this.saveImage(file);

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

  // Helper para processar imagem (reutilizando sua lógica de Sharp)
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