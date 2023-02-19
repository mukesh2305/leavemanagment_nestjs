// create deprtment schema
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ContactUsDocument = ContactUs & Document;

@Schema({ timestamps: true })
export class ContactUs {
  @Prop({
    type: String,
  })
  email;
  @Prop({
    type: String,
    required: true,
  })
  name;
  @Prop({
    type: String,
    required: true,
  })
  subject;

  @Prop({
    type: String,
    required: true,
  })
  contact_number;

  @Prop({
    type: String,
    required: true,
  })
  message;
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Users',
    required: true,
  })
  user_id;
}

export const ContactUsSchema = SchemaFactory.createForClass(ContactUs);
