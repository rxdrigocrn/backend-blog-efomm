import { IsOptional, IsString } from 'class-validator';

export class CreateLikeDto {
  @IsString()
  postId: string;

  @IsOptional()
  @IsString()
  userId?: string;
}
