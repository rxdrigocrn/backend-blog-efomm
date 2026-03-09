import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator'

export class CreateRedatorDto {

  @IsEmail()
  email: string

  @IsString()
  nome: string

  @IsString()
  @MinLength(6)
  password: string

  @IsOptional()
  @IsString()
  bio?: string

  @IsOptional()
  @IsString()
  avatarUrl?: string
}