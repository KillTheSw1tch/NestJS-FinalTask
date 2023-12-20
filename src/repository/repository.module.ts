// repository.module.ts

import { Module } from '@nestjs/common';
import { RepositoryService } from './repository.service';
import { RepositoryController } from './repository.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [RepositoryService ],
  imports: [HttpModule],
  controllers: [RepositoryController]
})
export class RepositoryModule {}
