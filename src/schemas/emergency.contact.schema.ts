import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type EmergencyContactsDocument = EmergencyContacts & Document;

@Schema({ timestamps: true })
export class EmergencyContacts {
  @Prop({
    type: String,
  })
  name;

  @Prop({
    type: String,
  })
  relationship;

  @Prop({
    type: String,
  })
  contact_number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
  })
  userId;
}

export const EmergencyContactsSchema =
  SchemaFactory.createForClass(EmergencyContacts);
