// document schema

// Role schema
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type DocUploadDocument = DocUpload & Document;

@Schema({ timestamps: true })
export class DocUpload {
  @Prop({ type: String, required: true })
  doc_url: string;
  @Prop({
    type: String,
    enum: ['IDs', 'certifications', 'work'],
  })
  main_doc_type;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Users',
  })
  user_id: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Users',
  })
  doc_uploaded_by: string;

  @Prop({
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
    unique: false,
  })
  verification_status;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Users',
  })
  verified_by: string;

  @Prop({
    type: String,
  })
  sub_doc_type: string;

  @Prop({
    type: String,
  })
  doc_id: string;

  @Prop({
    type: Array,
  })
  proof: Array<string>;

  @Prop({
    type: String,
  })
  doc_title: string;

  @Prop({
    type: String,
  })
  doc_description;
}

export const DocUploadSchema = SchemaFactory.createForClass(DocUpload);
