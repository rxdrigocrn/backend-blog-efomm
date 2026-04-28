import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { Prisma } from '@prisma/client';

@Injectable()
export class LikesService {
  constructor(private prisma: PrismaService) {}

  async createLike(postId: string, userId?: string, ip?: string) {
    try {
      const data: Prisma.PostLikeCreateInput = {
        post: { connect: { id: postId } } as any,
        postId,
        userId: userId ?? undefined,
        ip: ip ?? undefined,
      } as any;

      return await this.prisma.postLike.create({ data });
    } catch (err: any) {
      // Prisma unique constraint error code P2002 -> idempotent
      if (err?.code === 'P2002') return null;
      throw err;
    }
  }

  async removeLike(postId: string, userId?: string, ip?: string) {
    if (userId) {
      await this.prisma.postLike.deleteMany({ where: { postId, userId } });
      return;
    }

    if (ip) {
      await this.prisma.postLike.deleteMany({ where: { postId, ip } });
      return;
    }

    // nothing to do if neither provided
  }

  async countLikes(postId: string) {
    return this.prisma.postLike.count({ where: { postId } });
  }
}
