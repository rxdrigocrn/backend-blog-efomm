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
  const inUse = await this.prisma.user.count({
    where: {
      tags: {
        some: { id } // 🔥 "some" verifica se a tag está na lista de qualquer usuário
      },
    },
  });

  if (inUse > 0) {
    throw new BadRequestException('Esta tag está vinculada a usuários e não pode ser excluída.');
  }

  return this.prisma.tag.delete({
    where: { id },
  });
}
}