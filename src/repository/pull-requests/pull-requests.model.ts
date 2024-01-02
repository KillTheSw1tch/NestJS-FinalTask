// pull-request.model.ts

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class PullRequest {
  @Prop()
  number: number;

  @Prop()
  title: string;

  // Додайте інші поля пул-реквесту за потребою
}

export type PullRequestDocument = PullRequest & Document;

export const PullRequestSchema = SchemaFactory.createForClass(PullRequest);
