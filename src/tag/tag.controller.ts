import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { TagService } from './tag.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard, RolesGuard) // 🔥 A ORDEM IMPORTA: JWT primeiro, depois Roles
@Controller('tags')
export class TagController {
  constructor(private readonly service: TagService) {}

  @Post()
  @Roles(Role.PRESIDENTE)
  create(@Body() body: { name: string }, @Req() req) {
    return this.service.create(body, req.user);
  }

  @Get()
  findAll() {
    return this.service.findAll(); // pode deixar aberto
  }

  @Patch(':id')
  @Roles(Role.PRESIDENTE)
  update(@Param('id') id: string, @Body() body: { name?: string }, @Req() req) {
    return this.service.update(id, body, req.user);
  }

  @Delete(':id')
  @Roles(Role.PRESIDENTE)
  delete(@Param('id') id: string, @Req() req) {
    return this.service.delete(id, req.user);
  }
}