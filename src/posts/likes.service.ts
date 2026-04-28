import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { Prisma } from '@prisma/client';

@Injectable()
export class LikesService {
  private readonly logger = new Logger(LikesService.name);

  constructor(private prisma: PrismaService) {}

  async createLike(postId: string, userId?: string, ip?: string) {
    if (!postId) {
      this.logger.warn('createLike chamado sem postId');
      return null;
    }

    if (!userId && !ip) {
      this.logger.warn('createLike chamado sem userId e sem ip');
      return null;
    }

    try {
      const data: Prisma.PostLikeCreateInput = {
        postId,
        userId: userId ?? undefined,
        ip: ip ?? undefined,
      } as any;

      return await this.prisma.postLike.create({ data });
    } catch (err: any) {
      this.logger.error('Erro em createLike', err?.message ?? err);
      // Idempotência para unique constraint (já curtido)
      if (err?.code === 'P2002') return null;
      // Registro relacionado não encontrado / outros erros conhecidos
      if (err?.code === 'P2025') return null;
      // Em caso de erro inesperado, não propagar 500: log e retornar null
      return null;
    }
  }

  async removeLike(postId: string, userId?: string, ip?: string) {
    if (!postId) {
      this.logger.warn('removeLike chamado sem postId');
      return 0;
    }

    try {
      if (userId) {
        const res = await this.prisma.postLike.deleteMany({ where: { postId, userId } });
        return res.count;
      }

      if (ip) {
        const res = await this.prisma.postLike.deleteMany({ where: { postId, ip } });
        return res.count;
      }

      return 0;
    } catch (err: any) {
      this.logger.error('Erro em removeLike', err?.message ?? err);
      return 0;
    }
  }

  async countLikes(postId: string) {
    if (!postId) return 0;
    try {
      return await this.prisma.postLike.count({ where: { postId } });
    } catch (err: any) {
      this.logger.error('Erro em countLikes', err?.message ?? err);
      return 0;
    }
  }
}