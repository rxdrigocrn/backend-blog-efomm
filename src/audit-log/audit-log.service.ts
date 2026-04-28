import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

export interface AuditActor {
  userId?: string;
  email: string;
  role: Role;
}

export interface CreateAuditLogInput {
  actor: AuditActor;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  summary: string;
  metadata?: Prisma.InputJsonValue;
}

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  record(input: CreateAuditLogInput) {
    const { actor, action, entityType, entityId, summary, metadata } = input;

    return this.prisma.auditLog.create({
      data: {
        actorId: actor.userId,
        actorEmail: actor.email,
        actorRole: actor.role,
        action,
        entityType,
        entityId,
        summary,
        metadata,
      },
    });
  }

  findAll(filters: { entityType?: string; action?: string; limit?: number } = {}) {
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 100;

    return this.prisma.auditLog.findMany({
      where: {
        ...(filters.entityType ? { entityType: filters.entityType } : {}),
        ...(filters.action ? { action: filters.action } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        actor: { select: { id: true, nome: true, email: true, role: true } },
      },
    });
  }
}