import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateRedatorDto } from './dto/create-redator.dto'
import { UpdateRedatorDto } from './dto/update-redator.dto'
import * as bcrypt from 'bcrypt'

@Injectable()
export class RedatoresService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateRedatorDto) {
    const passwordHash = await bcrypt.hash(data.password, 10)

    return this.prisma.user.create({
      data: {
        email: data.email,
        nome: data.nome,
        password: passwordHash,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        role: 'REDATOR',
      },
    })
  }

  async findAll(search?: string) {
    return this.prisma.user.findMany({
      where: {
        role: 'REDATOR',
        nome: {
          contains: search,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        nome: true,
        email: true,
        bio: true,
        avatarUrl: true,
      },
    })
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