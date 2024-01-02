// Modules and decorators
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CommitSchema } from "./commits.model";

@Module({
  imports: [MongooseModule.forFeature([{ name: "Commit", schema: CommitSchema }])],
  exports: [MongooseModule],
})
export class CommitModule {}
