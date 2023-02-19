import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type FamilyDocument = Family & Document;

@Schema({ timestamps: true })
export class Family {
  @Prop({
    type: String,
  })
  name;

  @Prop({
    type: String,
  })
  relationship;
  @Prop({
    type: Date,
  })
  date_of_birth;
  @Prop({
    type: Boolean,
  })
  dependent;
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
  })
  userId;
}

export const FamilySchema = SchemaFactory.createForClass(Family);
