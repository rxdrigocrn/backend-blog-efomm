import { IsOptional, IsString, IsBoolean, IsInt, Min, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class FindPostsDto {
  @IsOptional()
  @IsString()
  search?: string; // Busca por título do post

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  publicado?: boolean; // Filtro por status de publicação

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    // Converte valor único em array, ou mantém array como está
    return Array.isArray(value) ? value : [value];
  })
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