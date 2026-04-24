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
  UploadedFile,
  Req
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
// import { v4 as uuid } from 'uuid'; // Comentado
// import sharp from 'sharp'; // Comentado
// import * as fs from 'fs'; // Comentado
// import * as path from 'path'; // Comentado

import { UserService } from './profile.service'; 
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from '@prisma/client';
import { CreateUserDto } from './dto/create-profile.dto';
import { UpdateUserDto } from './dto/update-profile.dto';
import { UploadService } from '../upload/upload.service'; // 🔥 Injetado

@Controller('users')
export class UserController {
  constructor(
    private readonly service: UserService,
    private readonly uploadService: UploadService, // 🔥 Injetado
  ) {}

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
      // 🔥 Agora usa o Vercel Blob via UploadService
      avatarUrl = await this.uploadService.uploadFile(file, 'avatars');
    }

    return this.service.create({ ...body, avatarUrl });
  }

  @Get()
  findAll() {
    return this.service.findAll();  
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async update(
    @Param('id') id: string, 
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UpdateUserDto,
    @Req() req
  ) {
    let avatarUrl = body.avatarUrl;

    if (file) {
      // 🔥 Agora usa o Vercel Blob
      avatarUrl = await this.uploadService.uploadFile(file, 'avatars');
    }

    const updateData = { ...body };
    if (avatarUrl) updateData.avatarUrl = avatarUrl;

    return this.service.update(id, updateData, req.user.userId, req.user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PRESIDENTE)
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  /* 🔥 LÓGICA ANTIGA DE DISCO COMENTADA
  // Aqui a lógica já estava repetida dentro dos métodos no seu original,
  // então a remoção limpa bem o código.
  */
}