import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import { Users } from './user.schema';

export type MyLeaveDocument = LeaveType & Document;

@Schema({ timestamps: true })
export class LeaveType {
  @Prop({
    type: String,
    unique: true,
  })
  leave_type;

  @Prop({
    type: Number,
  })
  leave_balance;

  @Prop({
    type: String,
  })
  leave_description;

  @Prop({
    type: Boolean,
    default: false,
  })
  carry_forward;

  @Prop({
    type: Number,
  })
  carry_forward_max;

  @Prop({
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status;
  @Prop({
    type: String,
    enum: ['consider', 'notconsider'],
    default: 'notconsider',
  })
  holiday;
  @Prop({
    type: String,
    enum: ['consider', 'notconsider'],
    default: 'notconsider',
  })
  weekend;
}

export const MyLeaveSchema = SchemaFactory.createForClass(LeaveType);
