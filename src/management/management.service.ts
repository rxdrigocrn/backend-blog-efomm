import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ManagementService {
  constructor(private prisma: PrismaService) {}

  private formatPhotoUrl(member: any) {
    if (member?.photoUrl && !member.photoUrl.startsWith('http')) {
      const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
      const normalizedPath = member.photoUrl.startsWith('/uploads')
        ? `/api${member.photoUrl}`
        : member.photoUrl;
      member.photoUrl = `${baseUrl.replace(/\/$/, '')}${normalizedPath.startsWith('/') ? '' : '/'}${normalizedPath}`;
    }
    return member;
  }

  async create(data: any) {
    const member = await this.prisma.management.create({ data });
    return this.formatPhotoUrl(member);
  }

  async findAll() {
    const members = await this.prisma.management.findMany({
      orderBy: { order: 'asc' },
    });
    return members.map(m => this.formatPhotoUrl(m));
  }

  async update(id: string, data: any) {
    try {
      const member = await this.prisma.management.update({
        where: { id },
        data,
      });
      return this.formatPhotoUrl(member);
    } catch {
      throw new NotFoundException('Membro da gerência não encontrado');
    }
  }

  async delete(id: string) {
    return this.prisma.management.delete({ where: { id } });
  }
}