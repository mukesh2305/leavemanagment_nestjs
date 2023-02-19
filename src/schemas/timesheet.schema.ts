// create deprtment schema
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type TimesheetDocument = Timesheet & Document;

@Schema({ timestamps: true })
export class Timesheet {
  @Prop({
    type: Date,
    required: true,
  })
  date;
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Project',
  })
  project;
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
  })
  user_id;

  @Prop({
    type: String,
  })
  task;

  @Prop({
    type: String,
    enum: ['worked', 'holiday', 'leave'],
  })
  type;

  @Prop({
    type: String,
  })
  custom;

  @Prop({
    type: String,
  })
  day;

  @Prop({
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status;

  @Prop({
    type: String,
  })
  rejection_reason;

  @Prop({
    type: Boolean,
    default: false,
  })
  is_submitted;
}

export const TimesheetSchema = SchemaFactory.createForClass(Timesheet);
