// create deprtment schema
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
  @Prop({
    type: String,
    unique: true,
    trim: true,
    required: true,
  })
  title;
  @Prop({
    type: String,
  })
  description;

  @Prop({
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
