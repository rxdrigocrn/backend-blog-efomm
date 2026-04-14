import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedatorsModule } from './redators/redators.module';
import { TagModule } from './tag/tag.module';
import { UserModule } from './profile/profile.module';

@Module({
  imports: [AuthModule, PostsModule, PrismaModule, RedatorsModule, TagModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
