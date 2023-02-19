// create deprtment schema
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type IssuesDocument = Issues & Document;

@Schema({ timestamps: true })
export class Issues {
  @Prop({
    type: String,
    unique: true,
    trim: true,
    required: true,
  })
  issue;
  @Prop({
    type: Boolean,
    default: false,
  })
  is_date;
}

export const IssuesSchema = SchemaFactory.createForClass(Issues);
