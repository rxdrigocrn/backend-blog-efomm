import { Module } from '@nestjs/common';
import { UserService } from './profile.service';
import { UserController } from './profile.controller';

@Module({
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}