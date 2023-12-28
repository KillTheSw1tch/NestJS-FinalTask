// repository.module.ts

import { Module } from '@nestjs/common';
import { RepositoryService } from './repository.service';
import { RepositoryController } from './repository.controller';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { RepositorySchema } from './repository.model';


@Module({
  providers: [RepositoryService],
  imports: [HttpModule, MongooseModule.forFeature([{name: 'Repository', schema: RepositorySchema}])],
  controllers: [RepositoryController]
})
export class RepositoryModule {}
