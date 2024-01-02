// repository.module.ts

import { Module } from "@nestjs/common";
import { RepositoryService } from "./repository.service";
import { RepositoryController } from "./repository.controller";
import { HttpModule } from "@nestjs/axios";
import { MongooseModule } from "@nestjs/mongoose";
import { RepositorySchema } from "./repository.model";
import { CommitSchema } from "./commits/commits.model";
import { PullRequestSchema } from "./pull-requests/pull-requests.model";

@Module({
  providers: [RepositoryService],
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: "Repository", schema: RepositorySchema },
      { name: "CommitSchema", schema: CommitSchema },
      { name: "PullRequestSchema", schema: PullRequestSchema },
    ]),
  ],
  controllers: [RepositoryController],
})
export class RepositoryModule {}
