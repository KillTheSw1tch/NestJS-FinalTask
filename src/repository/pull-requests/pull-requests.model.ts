// Modules and decorators
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

// Mongoose schema for the Pull-Request entity.
@Schema()
export class PullRequest {
  @Prop()
  number: number;

  @Prop()
  title: string;
}
// Mongoose schema for the Pull-Request entity
export const PullRequestSchema = SchemaFactory.createForClass(PullRequest);
