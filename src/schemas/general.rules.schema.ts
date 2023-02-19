// create deprtment schema
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type GeneralRuleDocument = GeneralRule & Document;

@Schema({ timestamps: true })
export class GeneralRule {
  @Prop({
    type: String,
  })
  rule_name: string;

  @Prop({
    type: String,
  })
  rule_description: string;

  @Prop({
    type: String,
  })
  rule_type: string;
}

export const GeneralRuleSchema = SchemaFactory.createForClass(GeneralRule);
