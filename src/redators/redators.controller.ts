import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RedatoresService } from './redators.service';
import { CreateRedatorDto } from './dto/create-redator.dto';
import { UpdateRedatorDto } from './dto/update-redator.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Query } from '@nestjs/common';

@Controller('redatores')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PRESIDENTE')
export class RedatoresController {
  constructor(private service: RedatoresService) {}

  @Post()
  create(@Body() dto: CreateRedatorDto) {
    return this.service.create(dto)
  }

  @Get()
  findAll(@Query('search') search?: string) {
    return this.service.findAll(search)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRedatorDto,
  ) {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}