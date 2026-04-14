import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength, IsArray } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  nome: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsArray() // 🔥 Mudança aqui: agora aceita array
  @IsString({ each: true }) // Valida se cada item do array é string
  tagIds?: string[];
}