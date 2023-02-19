// create deprtment schema
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type TicketDocument = Ticket & Document;

@Schema({ timestamps: true })
export class Ticket {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Issues',
  })
  issue;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
  })
  user_id;

  @Prop({
    type: String,
  })
  message;
  @Prop({
    type: String,
  })
  comment;
  @Prop({
    type: Array,
  })
  documents: Array<string>;
  @Prop({
    type: String,
    unique: true,
    trim: true,
    required: true,
  })
  track_id;

  @Prop({
    type: String,
    enum: ['open', 'progress', 'closed'],
    default: 'open',
  })
  status;

  @Prop({
    type: Date,
  })
  date;

  @Prop({
    type: Date,
  })
  start_date;

  @Prop({
    type: Date,
  })
  end_date;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
