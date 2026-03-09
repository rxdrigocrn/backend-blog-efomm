import { Module } from '@nestjs/common';

import { RedatoresService } from './redators.service';
import { RedatoresController } from './redators.controller';

@Module({
  controllers: [RedatoresController],
  providers: [RedatoresService],
})
export class RedatorsModule {}
