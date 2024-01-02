import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

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

export const RepositorySchema = SchemaFactory.createForClass(Repository);
