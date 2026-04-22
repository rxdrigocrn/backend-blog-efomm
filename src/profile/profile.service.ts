import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-profile.dto';
import { UpdateUserDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

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

  async create(data: CreateUserDto) {
    const { tagIds, password, ...rest } = data;
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...rest,
        password: passwordHash,
        role: data.role ?? Role.REDATOR,
        tags: tagIds ? {
          connect: tagIds.map(id => ({ id }))
        } : undefined,
      },
      select: { // Use select ou include, aqui mantive o select para ser consistente
        id: true,
        email: true,
        nome: true,
        bio: true,
        avatarUrl: true,
        role: true,
        tags: { select: { id: true, name: true } }, // 🔥 Ajustado para plural
      },
    });

    return this.formatAvatarUrl(user);
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nome: true,
        bio: true,
        avatarUrl: true,
        role: true,
        tags: { select: { id: true, name: true } }, // 🔥 Ajustado para plural
      },
      orderBy: { nome: 'asc' },
    });

    return users.map(user => this.formatAvatarUrl(user));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nome: true,
        bio: true,
        avatarUrl: true,
        role: true,
        tags: { select: { id: true, name: true } }, // 🔥 Ajustado para plural
      },
    });

    if (!user) throw new NotFoundException('Usuario nao encontrado');
    return this.formatAvatarUrl(user);
  }

  async update(id: string, data: any, currentUserId: string, currentUserRole: Role) {
    await this.findOne(id);

    if (currentUserRole !== Role.PRESIDENTE && currentUserId !== id) {
      throw new ForbiddenException('Sem permissão para editar este usuário');
    }

    const { tagIds, password, ...rest } = data;

    const updateData: any = { ...rest };
    if (password) updateData.password = await bcrypt.hash(password, 10);

    if (currentUserRole !== Role.PRESIDENTE) {
      delete updateData.role;
    }

    if (tagIds && currentUserRole === Role.PRESIDENTE) {
      updateData.tags = {
        set: tagIds.map(id => ({ id }))
      };
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        nome: true,
        bio: true,
        avatarUrl: true,
        role: true,
        tags: { select: { id: true, name: true } }, // 🔥 Ajustado para plural
      },
    });

    return this.formatAvatarUrl(updatedUser);
  }

  async delete(id: string) {
    await this.findOne(id);

    const deletedUser = await this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        email: true,
        nome: true,
        bio: true,
        avatarUrl: true,
        role: true,
        tags: { select: { id: true, name: true } }, // 🔥 Ajustado para plural
      },
    });

    return this.formatAvatarUrl(deletedUser);
  }
}