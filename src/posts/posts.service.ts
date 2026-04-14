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

  // 🔥 Helper genérico para formatar qualquer URL relativa para absoluta
  private formatUrl(url: string | null | undefined): string {
    if (!url || url.startsWith('http')) return url || "";
    
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000/api';
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    
    return `${cleanBaseUrl}${cleanPath}`;
  }

  // 🔥 Helper que aplica a formatação na imagem do post e no avatar do autor
  private formatPostData(post: any) {
    if (!post) return post;

    const formattedPost = {
      ...post,
      imagemUrl: this.formatUrl(post.imagemUrl),
    };

    // Se o post trouxer os dados do autor e ele tiver um avatar, formata também!
    if (formattedPost.autor && formattedPost.autor.avatarUrl) {
      formattedPost.autor = {
        ...formattedPost.autor,
        avatarUrl: this.formatUrl(formattedPost.autor.avatarUrl),
      };
    }

    return formattedPost;
  }

  // 🌍 LISTAGEM PÚBLICA (PORTAL DE NOTÍCIAS)
  async findAllPublic(filters: FindPostsDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      publicado: true,
    };

    if (filters.search) {
      where.titulo = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    const [posts, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        include: {
          autor: {
            select: { nome: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.post.count({ where }),
    ]);

    // Aplica o formatador
    const formattedPosts = posts.map(post => this.formatPostData(post));

    return {
      data: formattedPosts,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  // 🌍 BUSCA ÚNICA PÚBLICA (LER NOTÍCIA)
  async findOnePublic(id: string) {
    const post = await this.prisma.post.findFirst({
      where: { 
        id: id,
        publicado: true,
      },
      include: {
        autor: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Notícia não encontrada ou ainda não foi publicada.');
    }

    return this.formatPostData(post);
  }

  // 🔒 LISTAGEM PRIVADA (DASHBOARD)
  async findAll(filters: FindPostsDto, userId: string, role: Role) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (role !== Role.PRESIDENTE) {
      where.autorId = userId;
    }

    if (filters.search) {
      where.titulo = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    if (filters.publicado !== undefined) {
      where.publicado = String(filters.publicado) === 'true';
    }

    const [posts, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        include: {
          autor: {
            select: { nome: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.post.count({ where }),
    ]);

    const formattedPosts = posts.map(post => this.formatPostData(post));

    return {
      data: formattedPosts,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async create(createPostDto: CreatePostDto, userId: string) {
    const slug = createPostDto.titulo
      .toLowerCase()
      .replace(/ /g, '-');

    const post = await this.prisma.post.create({
      data: {
        titulo: createPostDto.titulo,
        conteudo: createPostDto.conteudo,
        publicado: createPostDto.publicado ?? true,
        imagemUrl: createPostDto.imagemUrl || "",
        slug,
        autorId: userId,
      },
      include: {
        autor: {
          select: { nome: true, avatarUrl: true },
        },
      },
    });

    return this.formatPostData(post);
  }

  async update(id: string, dto: UpdatePostDto, userId: string, role: Role) {
    const postExists = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!postExists) throw new NotFoundException('Post não encontrado');

    if (postExists.autorId !== userId && role !== Role.PRESIDENTE) {
      throw new ForbiddenException('Sem permissão para editar');
    }

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: dto,
      include: {
        autor: {
          select: { nome: true, avatarUrl: true },
        },
      },
    });

    return this.formatPostData(updatedPost);
  }

  async remove(id: string, userId: string, role: Role) {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) throw new NotFoundException('Post não encontrado');

    if (post.autorId !== userId && role !== Role.PRESIDENTE) {
      throw new ForbiddenException('Sem permissão para excluir');
    }

    return this.prisma.post.delete({
      where: { id },
      include: {
        autor: {
          select: { nome: true, avatarUrl: true },
        },
      },
    });
  }
}