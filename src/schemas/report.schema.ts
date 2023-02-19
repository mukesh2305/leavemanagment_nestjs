import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReportDocument = Report & Document;

@Schema({ timestamps: true })
export class Report {
  @Prop({
    type: String,
  })
  user_id;
  @Prop({
    type: Date,
    required: true,
  })
  total_time;

  @Prop({
    type: Date,
    required: true,
  })
  date;
  @Prop({
    type: Date,
    required: true,
  })
  clockin_time;

  @Prop({
    type: Date,
    required: true,
  })
  clockout_time;
  @Prop({
    type: String,
    required: true,
  })
  clockin_location;

  @Prop({
    type: String,
    required: true,
  })
  clockout_location;

  @Prop({
    type: Boolean,
    required: true,
  })
  is_manual;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
