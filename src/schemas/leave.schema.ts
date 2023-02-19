import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type LeaveDocument = Leaves & Document;

@Schema({ timestamps: true })
export class Leaves {
  @Prop({
    type: String,
  })
  leave_type;

  @Prop({
    type: Number,
  })
  leave_amount;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'Users' })
  applied_by: string;
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    ref: 'UserLeave',
  })
  user_leave_id: string;

  @Prop({ type: String, enum: ['first-half', 'second-half', 'full-day'] })
  startDateLeaveType;
  @Prop({ type: String, enum: ['first-half', 'second-half', 'full-day'] })
  endDateLeaveType;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Users' })
  action_by: string;

  @Prop({ required: true })
  reason: string;

  @Prop({
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  action_by_status: string;

  @Prop({
    type: String,
    enum: ['approved', 'rejected', 'pending'],
    default: 'pending',
    unique: false,
  })
  status;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Users' })
  approved_by: string;

  @Prop({ type: String, default: '' })
  rejection_reason: string;

  @Prop({ type: String, default: '' })
  rejection_reason_rm: string;
}

export const LeavesSchema = SchemaFactory.createForClass(Leaves);
