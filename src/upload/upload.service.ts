// src/upload/upload.service.ts
import { Injectable } from '@nestjs/common';
import { put } from '@vercel/blob';

@Injectable()
export class UploadService {
  async uploadFile(file: Express.Multer.File, folder: string) {
    const blob = await put(`${folder}/${Date.now()}-${file.originalname}`, file.buffer, {
      access: 'public',
    });
    return blob.url; // Retorna a URL final da Vercel
  }
}