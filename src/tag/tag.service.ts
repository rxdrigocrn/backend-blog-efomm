import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}

  create(data: { name: string }) {
    return this.prisma.tag.create({ data });
  }

  findAll() {
    return this.prisma.tag.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  update(id: string, data: { name?: string }) {
    return this.prisma.tag.update({
      where: { id },
      data,
    });
  }

 async delete(id: string) {
  const [inUseByUsers, inUseByPosts] = await this.prisma.$transaction([
    this.prisma.user.count({
      where: {
        tags: {
          some: { id } // 🔥 "some" verifica se a tag está na lista de qualquer usuário
        },
      },
    }),
    this.prisma.post.count({
      where: {
        tags: {
          some: { id }
        },
      },
    }),
  ]);

  if (inUseByUsers > 0 || inUseByPosts > 0) {
    throw new BadRequestException('Esta tag está vinculada a usuários ou posts e não pode ser excluída.');
  }

  return this.prisma.tag.delete({
    where: { id },
  });
}
}