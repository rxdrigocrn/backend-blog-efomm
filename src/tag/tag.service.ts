import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class TagService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  async create(data: { name: string }, actor: any) {
    const tag = await this.prisma.tag.create({ data });

    void this.auditLogService.record({
      actor,
      action: 'CREATE',
      entityType: 'tag',
      entityId: tag.id,
      summary: `Criou tag: ${tag.name}`,
      metadata: { name: tag.name },
    }).catch(() => undefined);

    return tag;
  }

  public findAll() {
    return this.prisma.tag.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: { name?: string }, actor: any) {
    const tag = await this.prisma.tag.update({
      where: { id },
      data,
    });

    void this.auditLogService.record({
      actor,
      action: 'UPDATE',
      entityType: 'tag',
      entityId: tag.id,
      summary: `Atualizou tag: ${tag.name}`,
      metadata: { name: tag.name },
    }).catch(() => undefined);

    return tag;
  }

  async delete(id: string, actor: any) {
    const [inUseByUsers, inUseByPosts] = await this.prisma.$transaction([
      this.prisma.user.count({
        where: {
          tags: {
            some: { id },
          },
        },
      }),
      this.prisma.post.count({
        where: {
          tags: {
            some: { id },
          },
        },
      }),
    ]);

    if (inUseByUsers > 0 || inUseByPosts > 0) {
      throw new BadRequestException('Esta tag está vinculada a usuários ou posts e não pode ser excluída.');
    }

    const tag = await this.prisma.tag.delete({
      where: { id },
    });

    void this.auditLogService.record({
      actor,
      action: 'DELETE',
      entityType: 'tag',
      entityId: tag.id,
      summary: `Removeu tag: ${tag.name}`,
      metadata: { name: tag.name },
    }).catch(() => undefined);

    return tag;
  }
}