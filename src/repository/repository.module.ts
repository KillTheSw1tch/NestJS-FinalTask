// Modules and decorators
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
    HttpModule, // External module for making HTTP requests.
    MongooseModule.forFeature([
      // Mongoose module to define the schemas for MongoDB.
      { name: "Repository", schema: RepositorySchema }, // Repository schema.
      { name: "CommitSchema", schema: CommitSchema }, // Commit schema.
      { name: "PullRequestSchema", schema: PullRequestSchema }, // Pull request schema.
    ]),
  ],
  controllers: [RepositoryController],
})
export class RepositoryModule {} // Definition of the Repository module.
