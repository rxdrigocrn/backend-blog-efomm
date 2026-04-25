import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ManagementService {
  constructor(private prisma: PrismaService) {}

  /* LÓGICA ANTIGA COMENTADA
  private formatPhotoUrl(member: any) {
    if (member?.photoUrl && !member.photoUrl.startsWith('http')) {
      const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
      const normalizedPath = member.photoUrl.startsWith('/uploads') ? `/api${member.photoUrl}` : member.photoUrl;
      member.photoUrl = `${baseUrl.replace(/\/$/, '')}${normalizedPath.startsWith('/') ? '' : '/'}${normalizedPath}`;
    }
    return member;
  }
  */

  async create(data: any) {
    return this.prisma.management.create({ data });
  }

  async findAll() {
    return this.prisma.management.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async update(id: string, data: any) {
    try {
      return await this.prisma.management.update({
        where: { id },
        data,
      });
    } catch {
      throw new NotFoundException('Membro não encontrado');
    }
  }

  async delete(id: string) {
    return this.prisma.management.delete({ where: { id } });
  }
}