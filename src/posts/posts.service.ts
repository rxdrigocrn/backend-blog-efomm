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
  // Injetando o Prisma
  constructor(private prisma: PrismaService) {}

  /* LÓGICA ANTIGA COMENTADA
  private formatUrl(url: string | null | undefined): string {
    if (!url || url.startsWith('http')) return url || "";
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000/api';
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${cleanBaseUrl}${cleanPath}`;
  }

  private formatPostData(post: any) {
    if (!post) return post;
    const rawImageUrls = Array.isArray(post.imagemUrls) ? post.imagemUrls : post.imagemUrl ? [post.imagemUrl] : [];
    const imagemUrls = rawImageUrls.map((url: string) => this.formatUrl(url));
    const formattedPost = {
      ...post,
      imagemUrls,
      imagemUrl: imagemUrls[0] || this.formatUrl(post.imagemUrl),
    };
    if (formattedPost.autor && formattedPost.autor.avatarUrl) {
      formattedPost.autor = {
        ...formattedPost.autor,
        avatarUrl: this.formatUrl(formattedPost.autor.avatarUrl),
      };
    }
    return formattedPost;
  }
  */

  async findAllPublic(filters: FindPostsDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;
    const where: any = { publicado: true };

    if (filters.search) {
      where.titulo = { contains: filters.search, mode: 'insensitive' };
    }

    const [posts, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where, skip, take: limit,
        include: {
          tags: { select: { id: true, name: true } },
          autor: { select: { nome: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.post.count({ where }),
    ]);

    // return posts.map(post => this.formatPostData(post)); // Comentado
    return {
      data: posts, // Retorno direto do banco (URLs do Blob já são absolutas)
      meta: { total, page, lastPage: Math.ceil(total / limit) },
    };
  }

  async findOnePublic(id: string) {
    const post = await this.prisma.post.findFirst({
      where: { id, publicado: true },
      include: {
        tags: { select: { id: true, name: true } },
        autor: true,
      },
    });

    if (!post) throw new NotFoundException('Notícia não encontrada.');
    // return this.formatPostData(post); // Comentado
    return post;
  }

  async findAll(filters: FindPostsDto, userId: string, role: Role) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (role !== Role.PRESIDENTE) where.autorId = userId;
    if (filters.search) where.titulo = { contains: filters.search, mode: 'insensitive' };
    if (filters.publicado !== undefined) where.publicado = String(filters.publicado) === 'true';

    const [posts, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where, skip, take: limit,
        include: {
          tags: { select: { id: true, name: true } },
          autor: { select: { nome: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data: posts,
      meta: { total, page, lastPage: Math.ceil(total / limit) },
    };
  }

  async create(createPostDto: CreatePostDto, userId: string) {
    const slug = createPostDto.titulo.toLowerCase().replace(/ /g, '-');
    const imageUrls = this.resolveImageUrls(createPostDto);
    const tagIds = this.resolveTagIds(createPostDto.tagIds ?? createPostDto.tags);

    const post = await this.prisma.post.create({
      data: {
        titulo: createPostDto.titulo,
        conteudo: createPostDto.conteudo,
        publicado: createPostDto.publicado ?? true,
        imagemUrl: imageUrls[0] || '',
        imagemUrls: imageUrls,
        tags: tagIds.length ? { connect: tagIds.map(id => ({ id })) } : undefined,
        slug,
        autorId: userId,
      } as any,
      include: {
        tags: { select: { id: true, name: true } },
        autor: { select: { nome: true, avatarUrl: true } },
      },
    });

    return post;
  }

  async update(id: string, dto: UpdatePostDto, userId: string, role: Role) {
    const postExists = await this.prisma.post.findUnique({ where: { id } });
    if (!postExists) throw new NotFoundException('Post não encontrado');
    if (postExists.autorId !== userId && role !== Role.PRESIDENTE) throw new ForbiddenException('Sem permissão');

    const dataToUpdate: any = { ...dto };
    if (dto.imagemUrl !== undefined || dto.imagemUrls !== undefined) {
      const imageUrls = this.resolveImageUrls(dto);
      dataToUpdate.imagemUrls = imageUrls;
      dataToUpdate.imagemUrl = imageUrls[0] || '';
    }

    if (dto.tagIds !== undefined || dto.tags !== undefined) {
      const tagIds = this.resolveTagIds(dto.tagIds ?? dto.tags);
      dataToUpdate.tags = { set: tagIds.map(id => ({ id })) };
    }

    return this.prisma.post.update({
      where: { id },
      data: dataToUpdate,
      include: {
        tags: { select: { id: true, name: true } },
        autor: { select: { nome: true, avatarUrl: true } },
      },
    });
  }

  async remove(id: string, userId: string, role: Role) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post não encontrado');
    if (post.autorId !== userId && role !== Role.PRESIDENTE) throw new ForbiddenException('Sem permissão');
    return this.prisma.post.delete({ where: { id } });
  }

  private resolveImageUrls(dto: CreatePostDto | UpdatePostDto): string[] {
    const imageUrlsFromArray = Array.isArray(dto.imagemUrls) ? dto.imagemUrls : [];
    const imageUrls = imageUrlsFromArray.map(url => String(url).trim()).filter(Boolean);
    if (!imageUrls.length && dto.imagemUrl) imageUrls.push(String(dto.imagemUrl).trim());
    return Array.from(new Set(imageUrls));
  }

  private resolveTagIds(tagIds?: string[]): string[] {
    if (!Array.isArray(tagIds)) return [];
    return Array.from(new Set(tagIds.map(id => String(id).trim()).filter(Boolean)));
  }
}