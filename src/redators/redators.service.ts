import { ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import {  CreateUserDto } from './dto/create-redator.dto'
import { UpdateRedatorDto } from './dto/update-redator.dto'
import * as bcrypt from 'bcrypt'
import { Role } from '@prisma/client'
import { AuditLogService } from '../audit-log/audit-log.service'

@Injectable()
export class RedatoresService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

async create(data: CreateUserDto, currentUserRole: Role, actor: any) {
  // 🔥 REGRA DE SEGURANÇA
  if (data.role === Role.PRESIDENTE && currentUserRole !== Role.PRESIDENTE) {
    throw new ForbiddenException('Você não pode criar um PRESIDENTE');
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await this.prisma.user.create({
    data: {
      email: data.email,
      nome: data.nome,
      password: passwordHash,
      bio: data.bio,
      avatarUrl: data.avatarUrl,
      role: data.role || Role.REDATOR, // default
    },
  });

  void this.auditLogService.record({
    actor,
    action: 'CREATE',
    entityType: 'user',
    entityId: user.id,
    summary: `Criou redator: ${user.nome}`,
    metadata: {
      email: user.email,
      nome: user.nome,
      role: user.role,
    },
  }).catch(() => undefined);

  return user;
}

async findAll(search: string | undefined, currentUserId: string) {
  return this.prisma.user.findMany({
    where: {
      id: {
        not: currentUserId, // 🔥 exclui o próprio usuário
      },
      ...(search && {
        nome: {
          contains: search,
          mode: 'insensitive',
        },
      }),
    },
    select: {
      id: true,
      nome: true,
      email: true,
      bio: true,
      avatarUrl: true,
      role: true,
    },
  });
}

  async findOne(id: string) {
    return this.prisma.user.findFirst({
      where: {
        id,
        role: 'REDATOR',
      },
    })
  }

  async update(id: string, data: UpdateRedatorDto, actor: any) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10)
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
    })

    void this.auditLogService.record({
      actor,
      action: 'UPDATE',
      entityType: 'user',
      entityId: user.id,
      summary: `Atualizou redator: ${user.nome}`,
      metadata: {
        email: user.email,
        nome: user.nome,
        role: user.role,
      },
    }).catch(() => undefined);

    return user;
  }

  async remove(id: string, actor: any) {
    const user = await this.prisma.user.delete({
      where: { id },
    })

    void this.auditLogService.record({
      actor,
      action: 'DELETE',
      entityType: 'user',
      entityId: user.id,
      summary: `Removeu redator: ${user.nome}`,
      metadata: {
        email: user.email,
        nome: user.nome,
        role: user.role,
      },
    }).catch(() => undefined);

    return user;
  }
}