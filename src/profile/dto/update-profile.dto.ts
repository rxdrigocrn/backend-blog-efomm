import { PartialType } from '@nestjs/mapped-types'; // ou '@nestjs/swagger' se estiver usando
import { CreateUserDto } from './create-profile.dto';

// O PartialType faz com que todos os campos do CreateUserDto fiquem opcionais para o Update
export class UpdateUserDto extends PartialType(CreateUserDto) {}