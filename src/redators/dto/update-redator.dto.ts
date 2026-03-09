    import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator'

export class UpdateRedatorDto {

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  nome?: string

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string

  @IsOptional()
  @IsString()
  bio?: string

  @IsOptional()
  @IsString()
  avatarUrl?: string
}