import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Users } from './user.schema';

export type UserLeaveDocument = UserLeave & Document;

@Schema({ timestamps: true })
export class UserLeave {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'LeaveType',
  })
  leave_type;

  @Prop({
    type: Number,
  })
  leave_balance;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Users' })
  user_id: Users;
}

export const UserLeaveSchema = SchemaFactory.createForClass(UserLeave);
