import { IsOptional, IsString, IsBoolean, IsInt, Min, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class FindPostsDto {
  @IsOptional()
  @IsString()
  search?: string; // Busca por título do post

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  publicado?: boolean; // Filtro por status de publicação

  @IsOptional()
  @IsArray()
  @Type(() => String)
  @IsString({ each: true })
  tagIds?: string[]; // Filtro por IDs de tags (filtra posts que tenham qualquer uma destas tags)

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}