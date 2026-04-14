import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

import { UserService } from './profile.service'; 
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from '@prisma/client';
import { CreateUserDto } from './dto/create-profile.dto';
import { UpdateUserDto } from './dto/update-profile.dto';

@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  // 🔥 Rota Protegida: Somente Presidente cria usuários
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PRESIDENTE)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateUserDto
  ) {
    let avatarUrl = body.avatarUrl;

    if (file) {
      const uploadPath = path.resolve('uploads');
      if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

      const filename = `avatar-${uuid()}.webp`;

      await sharp(file.buffer)
        .resize({ width: 400, height: 400, fit: 'cover' })
        .webp({ quality: 80 })
        .toFile(path.join(uploadPath, filename));

      avatarUrl = `/uploads/${filename}`;
    }

    return this.service.create({ ...body, avatarUrl });
  }

  // ✅ Rota Pública: Listar autores (para a página de notícias)
  @Get()
  findAll() {
    return this.service.findAll();  
  }

  // ✅ Rota Pública: Ver perfil específico (resolve o erro 401 do front-end)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // 🔥 Rota Protegida: Somente Presidente edita (ou o próprio usuário, se você implementar a lógica)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PRESIDENTE)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async update(
    @Param('id') id: string, 
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UpdateUserDto
  ) {
    let avatarUrl = body.avatarUrl;

    if (file) {
      const uploadPath = path.resolve('uploads');
      if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

      const filename = `avatar-${uuid()}.webp`;

      await sharp(file.buffer)
        .resize({ width: 400, height: 400, fit: 'cover' })
        .webp({ quality: 80 })
        .toFile(path.join(uploadPath, filename));

      avatarUrl = `/uploads/${filename}`;
    }

    const updateData = { ...body };
    if (avatarUrl) updateData.avatarUrl = avatarUrl;

    return this.service.update(id, updateData);
  }

  // 🔥 Rota Protegida: Somente Presidente deleta
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PRESIDENTE)
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}