import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express'; // ⬅️ Importação do Express
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS (frontend)
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
  });

  // Prefixo da API
  app.setGlobalPrefix('api');

  // 🔥 SOLUÇÃO DEFINITIVA PARA O 404:
  // Usar o express.static garante que o roteador não bloqueie o acesso aos arquivos.
  // process.cwd() pega a raiz exata do projeto onde a pasta uploads está.
  app.use('/api/uploads', express.static(join(process.cwd(), 'uploads')));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.API_PORT || 5000;

  await app.listen(port);

  console.log(`🚀 API running on http://localhost:${port}/api`);
}

bootstrap();