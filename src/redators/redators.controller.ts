import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { RedatoresService } from './redators.service';
import {  CreateUserDto } from './dto/create-redator.dto';
import { UpdateRedatorDto } from './dto/update-redator.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Query } from '@nestjs/common';
import { Role } from '@prisma/client';

@Controller('redatores')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PRESIDENTE)
export class RedatoresController {
  constructor(private redatoresService: RedatoresService) {}

  @Post()
  create(@Body() dto: CreateUserDto, @Req() req) {
    return this.redatoresService.create(dto, req.user.role, req.user);
  }

 @Get()
findAll(@Query('search') search: string, @Req() req) {
  return this.redatoresService.findAll(search, req.user.userId);
}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.redatoresService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRedatorDto, @Req() req) {
    return this.redatoresService.update(id, dto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.redatoresService.remove(id, req.user);
  }
}