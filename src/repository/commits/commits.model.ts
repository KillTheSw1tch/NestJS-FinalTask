// Modules and decorators
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

// Mongoose schema for the Commits entity.
@Schema()
export class Commit {
  @Prop()
  sha: string;

  @Prop()
  message: string;
}

// Mongoose schema for the Commits entity.
export const CommitSchema = SchemaFactory.createForClass(Commit);
