import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from '@prisma/client';

@UseGuards(RolesGuard)
@Controller('profiles')
export class ProfileController {
  constructor(private readonly service: ProfileService) {}

  @Post()
  @Roles(Role.PRESIDENTE)
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Get()
  findAll() {
    return this.service.findAll();  
  }

  @Patch(':id')
  @Roles(Role.PRESIDENTE)
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @Roles(Role.PRESIDENTE)
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}