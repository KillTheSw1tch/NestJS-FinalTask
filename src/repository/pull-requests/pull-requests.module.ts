// pull-request.module.ts

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PullRequestSchema } from "./pull-requests.model";

@Module({
  imports: [MongooseModule.forFeature([{ name: "PullRequest", schema: PullRequestSchema }])],
  exports: [MongooseModule],
})
export class PullRequestModule {}
