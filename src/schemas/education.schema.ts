import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type EducationDocument = Education & Document;

@Schema({ timestamps: true })
export class Education {
  @Prop({
    type: String,
    enum: [
      'graduation',
      'post-graduation',
      'doctorate',
      'deploma',
      'pre-university',
      'other-education',
      'certification',
    ],
  })
  qualificationType;
  @Prop({
    type: String,
  })
  courseName;
  @Prop({
    type: String,
  })
  stream;
  @Prop({
    type: String,
    enum: ['full-time', 'part-time', 'certificate', 'correspondence'],
  })
  courseType;
  @Prop({
    type: Date,
  })
  courseStartDate;
  @Prop({
    type: Date,
  })
  courseEndDate;
  @Prop({
    type: String,
  })
  collegeName;
  @Prop({
    type: String,
  })
  universityName;
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
  })
  userId;
}

export const EducationSchema = SchemaFactory.createForClass(Education);
