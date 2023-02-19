// create deprtment schema
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({
    type: String,
  })
  message;

  @Prop({
    type: String,
  })
  link;
  @Prop({
    type: Array,
  })
  show;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Users',
  })
  user_id: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Users',
  })
  action_by: string;

  @Prop({
    type: String,
    enum: ['read', 'unread'],
    default: 'unread',
  })
  status;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
