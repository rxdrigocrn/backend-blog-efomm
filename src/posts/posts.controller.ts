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
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
// import { v4 as uuid } from 'uuid'; // Comentado (Blob cuida do nome ou UploadService)
// import sharp from 'sharp'; // Comentado (Processamento pode ser feito no UploadService se quiser)
// import * as fs from 'fs'; // Comentado
// import * as path from 'path'; // Comentado

import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FindPostsDto } from './dto/find-posts.dto';
import { UploadService } from '../upload/upload.service'; // 🔥 Importe seu novo service

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly uploadService: UploadService, // 🔥 Injetado
  ) {}

  @Get('public')
  findAllPublic(@Query() filters: FindPostsDto) {
    return this.postsService.findAllPublic(filters);
  }

  @Get('public/:id')
  findOnePublic(@Param('id') id: string) {
    return this.postsService.findOnePublic(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() filters: FindPostsDto, @Req() req) {
    return this.postsService.findAll(
      filters,
      req.user.userId,
      req.user.role,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: 1 },
      { name: 'files', maxCount: 10 },
    ], {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // Aumentei para 5MB já que o Blob aguenta bem
    }),
  )
  async create(
    @UploadedFiles()
    files: {
      file?: Express.Multer.File[];
      files?: Express.Multer.File[];
    },
    @Body() dto: CreatePostDto,
    @Req() req,
  ) {
    let imageUrls = this.normalizeImageUrls(dto.imagemUrls);
    if (dto.imagemUrl) imageUrls.push(dto.imagemUrl);

    const uploadedFiles = this.getUploadedFiles(files);
    
    if (uploadedFiles.length > 0) {
      // 🔥 Agora usa o Vercel Blob via UploadService
      const uploadedImageUrls = await Promise.all(
        uploadedFiles.map(file => this.uploadService.uploadFile(file, 'posts')),
      );
      imageUrls = [...imageUrls, ...uploadedImageUrls];
    }

    imageUrls = this.normalizeImageUrls(imageUrls);

    if (!imageUrls.length) {
      throw new BadRequestException('Envie pelo menos uma imagem (file/files ou URL)');
    }

    const isPublicado = String(dto.publicado) === 'true';

    return this.postsService.create(
      {
        ...dto,
        imagemUrl: imageUrls[0],
        imagemUrls: imageUrls,
        publicado: isPublicado,
      },
      req.user.userId,
      req.user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: 1 },
      { name: 'files', maxCount: 10 },
    ], {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async update(
    @Param('id') id: string,
    @UploadedFiles()
    files: {
      file?: Express.Multer.File[];
      files?: Express.Multer.File[];
    },
    @Body() dto: UpdatePostDto,
    @Req() req,
  ) {
    const updateData = { ...dto };
    const uploadedFiles = this.getUploadedFiles(files);
    
    const hasImageUpdate =
      dto.imagemUrl !== undefined ||
      dto.imagemUrls !== undefined ||
      uploadedFiles.length > 0;

    if (hasImageUpdate) {
      let imageUrls = this.normalizeImageUrls(dto.imagemUrls);
      if (dto.imagemUrl) imageUrls.push(dto.imagemUrl);

      if (uploadedFiles.length > 0) {
        // 🔥 Upload para o Blob
        const uploadedImageUrls = await Promise.all(
          uploadedFiles.map(file => this.uploadService.uploadFile(file, 'posts')),
        );
        imageUrls = [...imageUrls, ...uploadedImageUrls];
      }

      imageUrls = this.normalizeImageUrls(imageUrls);
      updateData.imagemUrls = imageUrls;
      updateData.imagemUrl = imageUrls[0] || '';
    }
    
    if (dto.publicado !== undefined) {
      updateData.publicado = String(dto.publicado) === 'true';
    }

    return this.postsService.update(
      id,
      updateData,
      req.user.userId,
      req.user.role,
      req.user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.postsService.remove(
      id,
      req.user.userId,
      req.user.role,
      req.user,
    );
  }

  private getUploadedFiles(files: {
    file?: Express.Multer.File[];
    files?: Express.Multer.File[];
  }): Express.Multer.File[] {
    return [...(files?.file || []), ...(files?.files || [])];
  }

  private normalizeImageUrls(urls?: string[]): string[] {
    if (!urls || !Array.isArray(urls)) return [];
    return Array.from(new Set(urls.map(url => String(url).trim()).filter(Boolean)));
  }

  /* 🔥 LÓGICA ANTIGA DE DISCO COMENTADA
  private async saveImage(file: Express.Multer.File) {
    const uploadPath = path.resolve('uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

    const filename = `${uuid()}.webp`;
    await sharp(file.buffer)
      .resize({ width: 800 })
      .webp({ quality: 70 })
      .toFile(path.join(uploadPath, filename));

    return `/uploads/${filename}`;
  }
  */
}