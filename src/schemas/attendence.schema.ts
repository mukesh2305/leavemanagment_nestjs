import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type AttendenceDocument = Attendence & Document;

@Schema({ timestamps: true })
export class Attendence {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
  })
  user_id;
  @Prop({
    type: Number,
    default: Date.now,
  })
  time;
  @Prop({
    type: Number,
  })
  clockout_time;

  @Prop({
    type: Date,
    required: true,
  })
  date;
  @Prop({
    type: Number,
  })
  total_time;

  @Prop({
    type: String,
    // required: true,
  })
  clockin_location;
  @Prop({
    type: String,
    // required: true,
  })
  clockout_location;

  @Prop({
    type: Boolean,
    required: true,
  })
  is_clockin;
  @Prop({
    type: Boolean,
    default: false,
    // required: true,
  })
  is_clockout;

  @Prop({
    type: Boolean,
    default: false,
  })
  is_manual;
}

export const AttendenceSchema = SchemaFactory.createForClass(Attendence);
