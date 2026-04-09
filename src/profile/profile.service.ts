import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  create(data: {
    name: string;
    bio: string;
    imageUrl: string;
    tagId: string;
  }) {
    return this.prisma.profile.create({
      data,
      include: { tag: true },
    });
  }

  findAll() {
    return this.prisma.profile.findMany({
      include: { tag: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  update(
    id: string,
    data: {
      name?: string;
      bio?: string;
      imageUrl?: string;
      tagId?: string;
    },
  ) {
    return this.prisma.profile.update({
      where: { id },
      data,
      include: { tag: true },
    });
  }

  delete(id: string) {
    return this.prisma.profile.delete({
      where: { id },
    });
  }
}