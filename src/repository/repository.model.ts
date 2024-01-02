// Modules and decorators
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

// Mongoose schema for the Repository entity.
@Schema()
export class Repository extends Document {
  @Prop({ required: true, unique: true })
  link: string;

  @Prop()
  id: string;

  @Prop()
  api_url: string;

  @Prop()
  commits_url: string;

  @Prop({ default: 0 })
  commitsCount: number;

  @Prop()
  pullRequests_url: string;

  @Prop({ default: 0 })
  pullRequestsCount: number;

  @Prop()
  comment: string;
}

// Mongoose schema factory for the Repository entity.
export const RepositorySchema = SchemaFactory.createForClass(Repository);
