// commit.model.ts

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Commit {
  @Prop()
  sha: string;

  @Prop()
  message: string;

  // Додайте інші поля коміту за потребою
}

export type CommitDocument = Commit & Document;

export const CommitSchema = SchemaFactory.createForClass(Commit);
