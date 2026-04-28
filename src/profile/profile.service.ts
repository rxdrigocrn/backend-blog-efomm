import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-profile.dto';
import { UpdateUserDto } from './dto/update-profile.dto';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  /* LÓGICA ANTIGA COMENTADA
  private formatAvatarUrl(user: any) {
    if (!user) return user;
    let newAvatarUrl = user.avatarUrl;
    if (newAvatarUrl && !newAvatarUrl.startsWith('http')) {
      const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000/api';
      const cleanBaseUrl = baseUrl.replace(/\/$/, '');
      const cleanPath = newAvatarUrl.startsWith('/') ? newAvatarUrl : `/${newAvatarUrl}`;
      newAvatarUrl = `${cleanBaseUrl}${cleanPath}`;
    }
    return { ...user, avatarUrl: newAvatarUrl };
  }
  */

  async create(data: CreateUserDto, actor: any) {
    const { tagIds, password, ...rest } = data;
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...rest,
        password: passwordHash,
        role: data.role ?? Role.REDATOR,
        tags: tagIds ? { connect: tagIds.map(id => ({ id })) } : undefined,
      },
      select: {
        id: true, email: true, nome: true, bio: true, avatarUrl: true, role: true,
        tags: { select: { id: true, name: true } },
      },
    });

    void this.auditLogService.record({
      actor,
      action: 'CREATE',
      entityType: 'user',
      entityId: user.id,
      summary: `Criou usuário: ${user.nome}`,
      metadata: {
        email: user.email,
        nome: user.nome,
        role: user.role,
        tagCount: user.tags?.length ?? 0,
      },
    }).catch(() => undefined);

    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true, email: true, nome: true, bio: true, avatarUrl: true, role: true,
        tags: { select: { id: true, name: true } },
      },
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, nome: true, bio: true, avatarUrl: true, role: true,
        tags: { select: { id: true, name: true } },
      },
    });
    if (!user) throw new NotFoundException('Usuario nao encontrado');
    return user;
  }

  async update(id: string, data: any, currentUserId: string, currentUserRole: Role, actor: any) {
    await this.findOne(id);
    if (currentUserRole !== Role.PRESIDENTE && currentUserId !== id) {
      throw new ForbiddenException('Sem permissão');
    }

    const { tagIds, password, ...rest } = data;
    const updateData: any = { ...rest };
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (currentUserRole !== Role.PRESIDENTE) delete updateData.role;
    if (tagIds && currentUserRole === Role.PRESIDENTE) {
      updateData.tags = { set: tagIds.map(id => ({ id })) };
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true, email: true, nome: true, bio: true, avatarUrl: true, role: true,
        tags: { select: { id: true, name: true } },
      },
    });

    void this.auditLogService.record({
      actor,
      action: 'UPDATE',
      entityType: 'user',
      entityId: user.id,
      summary: `Atualizou usuário: ${user.nome}`,
      metadata: {
        email: user.email,
        nome: user.nome,
        role: user.role,
        tagCount: user.tags?.length ?? 0,
      },
    }).catch(() => undefined);

    return user;
  }

  async delete(id: string, actor: any) {
    await this.findOne(id);
    const user = await this.prisma.user.delete({
      where: { id },
      select: { id: true, email: true, nome: true, role: true },
    });

    void this.auditLogService.record({
      actor,
      action: 'DELETE',
      entityType: 'user',
      entityId: user.id,
      summary: `Removeu usuário: ${user.nome}`,
      metadata: {
        email: user.email,
        nome: user.nome,
        role: user.role,
      },
    }).catch(() => undefined);

    return user;
  }
}