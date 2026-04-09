import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { TagService } from './tag.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from '@prisma/client';

@UseGuards(RolesGuard)
@Controller('tags')
export class TagController {
  constructor(private readonly service: TagService) {}

  @Post()
  @Roles(Role.PRESIDENTE)
  create(@Body() body: { name: string }) {
    return this.service.create(body);
  }

  @Get()
  findAll() {
    return this.service.findAll(); // pode deixar aberto
  }

  @Patch(':id')
  @Roles(Role.PRESIDENTE)
  update(@Param('id') id: string, @Body() body: { name?: string }) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @Roles(Role.PRESIDENTE)
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}