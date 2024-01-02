// analysis-result.model.ts

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Repository } from "./repository.model";

@Schema()
export class AnalysisResult extends Document {
  @Prop({ required: true })
  commitsCount: number;

  @Prop({ required: true })
  pullRequestsCount: number;

  @Prop()
  comment: string;

  @Prop({ type: [{ type: "ObjectId", ref: "Repository" }] })
  repository: Repository;
}

export const AnalysisResultSchema = SchemaFactory.createForClass(AnalysisResult);
