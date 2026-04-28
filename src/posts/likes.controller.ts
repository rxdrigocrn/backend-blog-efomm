import { Controller, Post, Delete, Get, Body, Req, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { LikesService } from './likes.service';
import { CreateLikeDto } from './dto/create-like.dto';

@Controller('posts')
export class LikesController {
  constructor(private likesService: LikesService) {}

  @Post('like')
  @HttpCode(HttpStatus.OK)
  async createLike(@Body() dto: CreateLikeDto, @Req() req: any) {
    const ip = this.getIpFromReq(req);
    await this.likesService.createLike(dto.postId, dto.userId, ip);
    return { success: true };
  }

  @Delete('like')
  @HttpCode(HttpStatus.OK)
  async removeLike(@Body() dto: CreateLikeDto, @Req() req: any) {
    const ip = this.getIpFromReq(req);
    await this.likesService.removeLike(dto.postId, dto.userId, ip);
    return { success: true };
  }

  @Get(':id/likes')
  async count(@Param('id') id: string) {
    const count = await this.likesService.countLikes(id);
    return { postId: id, likes: count };
  }

  private getIpFromReq(req: any): string | undefined {
    const xff = req.headers && (req.headers['x-forwarded-for'] || req.headers['X-Forwarded-For']);
    if (xff) {
      const v = Array.isArray(xff) ? xff[0] : String(xff).split(',')[0].trim();
      return v;
    }
    return req.ip;
  }
}
