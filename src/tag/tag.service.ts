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
    const inUse = await this.prisma.profile.count({
      where: { tagId: id },
    });

    if (inUse > 0) {
      throw new BadRequestException('Tag já está sendo utilizada');
    }

    return this.prisma.tag.delete({
      where: { id },
    });
  }
}