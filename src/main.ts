import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';

let cachedApp: any;

async function bootstrap() {
  if (!cachedApp) {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.enableCors({
      origin: process.env.FRONTEND_URL || '*',
    });

    app.setGlobalPrefix('api');

    // ⚠️ ATENÇÃO: Na Vercel, servir arquivos estáticos locais ('uploads') 
    // não funciona para arquivos enviados pelos usuários.
    // Se forem arquivos fixos do repositório, use o caminho relativo ao projeto.

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();
    cachedApp = app.getHttpAdapter().getInstance();
  }
  return cachedApp;
}

export default async (req: any, res: any) => {
  const app = await bootstrap();
  app(req, res);
};