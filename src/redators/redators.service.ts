import { ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import {  CreateUserDto } from './dto/create-redator.dto'
import { UpdateRedatorDto } from './dto/update-redator.dto'
import * as bcrypt from 'bcrypt'
import { Role } from '@prisma/client'

@Injectable()
export class RedatoresService {
  constructor(private prisma: PrismaService) {}

async create(data: CreateUserDto, currentUserRole: Role) {
  // 🔥 REGRA DE SEGURANÇA
  if (data.role === Role.PRESIDENTE && currentUserRole !== Role.PRESIDENTE) {
    throw new ForbiddenException('Você não pode criar um PRESIDENTE');
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  return this.prisma.user.create({
    data: {
      email: data.email,
      nome: data.nome,
      password: passwordHash,
      bio: data.bio,
      avatarUrl: data.avatarUrl,
      role: data.role || Role.REDATOR, // default
    },
  });
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

  async update(id: string, data: UpdateRedatorDto) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10)
    }

    return this.prisma.user.update({
      where: { id },
      data,
    })
  }

  async remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    })
  }
}