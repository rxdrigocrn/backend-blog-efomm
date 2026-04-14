import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FindPostsDto } from './dto/find-posts.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 🌍 1. ROTA PÚBLICA (PORTAL DE NOTÍCIAS)
  // Não usa JwtAuthGuard. Acessível para qualquer visitante.
  @Get('public')
  findAllPublic(@Query() filters: FindPostsDto) {
    return this.postsService.findAllPublic(filters);
  }

  // 🌍 1.5. ROTA PÚBLICA (BUSCAR UMA NOTÍCIA ESPECÍFICA POR ID)
  // IMPORTANTE: Essa rota também não usa JwtAuthGuard
  @Get('public/:id')
  findOnePublic(@Param('id') id: string) {
    return this.postsService.findOnePublic(id);
  }

  // 🔒 2. ROTA PRIVADA (DASHBOARD)
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() filters: FindPostsDto, @Req() req) {
    return this.postsService.findAll(
      filters,
      req.user.userId,
      req.user.role,
    );
  }

  // 📌 CRIAR POST
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreatePostDto,
    @Req() req,
  ) {
    let imageUrl = dto.imagemUrl;
    const uploadPath = path.resolve('uploads');
    
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

    if (file) {
      const filename = `${uuid()}.webp`;
      await sharp(file.buffer)
        .resize({ width: 800 })
        .webp({ quality: 70 })
        .toFile(path.join(uploadPath, filename));

      imageUrl = `/uploads/${filename}`;
    }

    if (!imageUrl) {
      throw new BadRequestException('Envie uma imagem (file ou URL)');
    }

    // Como o FormData envia booleanos como string ('true' ou 'false'), fazemos o parse
    const isPublicado = String(dto.publicado) === 'true';

    return this.postsService.create(
      { ...dto, imagemUrl: imageUrl, publicado: isPublicado },
      req.user.userId,
    );
  }

  // 📌 UPDATE (AGORA SUPORTA UPLOAD DE IMAGEM!)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdatePostDto,
    @Req() req,
  ) {
    let imageUrl = dto.imagemUrl;
    
    // Se o usuário mandou uma foto nova no frontend, processamos e substituímos
    if (file) {
      const uploadPath = path.resolve('uploads');
      if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

      const filename = `${uuid()}.webp`;
      await sharp(file.buffer)
        .resize({ width: 800 })
        .webp({ quality: 70 })
        .toFile(path.join(uploadPath, filename));

      imageUrl = `/uploads/${filename}`;
    }

    // Tratamento seguro dos dados do Update
    const updateData = { ...dto };
    if (imageUrl) updateData.imagemUrl = imageUrl;
    
    // Converte string para boolean se vier via FormData
    if (dto.publicado !== undefined) {
      updateData.publicado = String(dto.publicado) === 'true';
    }

    return this.postsService.update(
      id,
      updateData,
      req.user.userId,
      req.user.role,
    );
  }

  // 📌 DELETE
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.postsService.remove(
      id,
      req.user.userId,
      req.user.role,
    );
  }
}