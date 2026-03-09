import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto, UpdatePostDto } from './dto/create-post.dto';
import { Role } from '@prisma/client';
import { FindPostsDto } from './dto/find-posts.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  // Criar post: Sempre vincula ao autor que está logado
  async create(createPostDto: CreatePostDto, userId: string) {
    const slug = createPostDto.titulo.toLowerCase().replace(/ /g, '-');

    return this.prisma.post.create({
      data: {
        ...createPostDto,
        slug,
        autorId: userId,
      },
    });
  }

  async findAll(filters: FindPostsDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.search) {
      where.titulo = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    if (filters.publicado !== undefined) {
      where.publicado = filters.publicado;
    }

    const [posts, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        include: {
          autor: {
            select: {
              nome: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data: posts,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  // Update com verificação de Role
  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    userId: string,
    role: Role,
  ) {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) throw new NotFoundException('Post não encontrado');

    // Regra: Se não for o dono e não for Presidente, bloqueia
    if (post.autorId !== userId && role !== Role.PRESIDENTE) {
      throw new ForbiddenException(
        'Você não tem permissão para editar este post',
      );
    }

    return this.prisma.post.update({
      where: { id },
      data: updatePostDto,
    });
  }

  // Delete com verificação de Role
  async remove(id: string, userId: string, role: Role) {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) throw new NotFoundException('Post não encontrado');

    if (post.autorId !== userId && role !== Role.PRESIDENTE) {
      throw new ForbiddenException(
        'Você não tem permissão para excluir este post',
      );
    }

    return this.prisma.post.delete({ where: { id } });
  }
}
