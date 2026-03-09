import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  conteudo: string;

  @IsString()
  @IsNotEmpty()
  imagemUrl: string;

  @IsOptional()
  @IsBoolean()
  publicado?: boolean;
}

export class UpdatePostDto extends CreatePostDto {}