import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class ManagementService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

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

  async create(data: any, actor: any) {
    const management = await this.prisma.management.create({ data });

    void this.auditLogService.record({
      actor,
      action: 'CREATE',
      entityType: 'management',
      entityId: management.id,
      summary: `Criou membro de management: ${management.nome}`,
      metadata: {
        nome: management.nome,
        cargo: management.cargo,
        isManagement: management.isManagement,
        isSobre: management.isSobre,
      },
    }).catch(() => undefined);

    return management;
  }

  async findAll() {
    return this.prisma.management.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async update(id: string, data: any, actor: any) {
    try {
      const management = await this.prisma.management.update({
        where: { id },
        data,
      });

      void this.auditLogService.record({
        actor,
        action: 'UPDATE',
        entityType: 'management',
        entityId: management.id,
        summary: `Atualizou membro de management: ${management.nome}`,
        metadata: {
          nome: management.nome,
          cargo: management.cargo,
          isManagement: management.isManagement,
          isSobre: management.isSobre,
        },
      }).catch(() => undefined);

      return management;
    } catch {
      throw new NotFoundException('Membro não encontrado');
    }
  }

  async delete(id: string, actor: any) {
    const management = await this.prisma.management.delete({ where: { id } });

    void this.auditLogService.record({
      actor,
      action: 'DELETE',
      entityType: 'management',
      entityId: management.id,
      summary: `Removeu membro de management: ${management.nome}`,
      metadata: {
        nome: management.nome,
        cargo: management.cargo,
      },
    }).catch(() => undefined);

    return management;
  }

  findLogs(filters: { entityType?: string; action?: string; limit?: string }) {
    const limit = filters.limit ? Number(filters.limit) : 100;

    return this.auditLogService.findAll({
      entityType: filters.entityType,
      action: filters.action,
      limit: Number.isFinite(limit) && limit > 0 ? limit : 100,
    });
  }
}