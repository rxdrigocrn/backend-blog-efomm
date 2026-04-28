// src/upload/upload.service.ts
import { Injectable } from '@nestjs/common';
import { put } from '@vercel/blob';
import sharp from 'sharp';

@Injectable()
export class UploadService {
  // Compacta/resiza imagens antes de enviar ao Blob para evitar 500 por arquivos gigantes
  async uploadFile(file: Express.Multer.File, folder: string) {
    let bufferToUpload = file.buffer;
    let filename = `${folder}/${Date.now()}-${file.originalname}`;

    try {
      if (file.mimetype && file.mimetype.startsWith('image/')) {
        // Reduz largura máxima e converte para webp para reduzir bastante o tamanho.
        // Ajuste width/quality conforme desejar.
        const optimized = await sharp(file.buffer)
          .resize({ width: 1600, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();

        bufferToUpload = optimized;
        // força extensão .webp
        const baseName = file.originalname.replace(/\.[^/.]+$/, '');
        filename = `${folder}/${Date.now()}-${baseName}.webp`;
      }
    } catch (err) {
      // Se falhar ao otimizar, continua com o buffer original (fail-open)
      bufferToUpload = file.buffer;
    }

    const blob = await put(filename, bufferToUpload, {
      access: 'public',
    });
    return blob.url; // Retorna a URL final da Vercel
  }
}