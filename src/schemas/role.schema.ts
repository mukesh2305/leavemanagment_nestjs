// Role schema
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import { Permission } from './permission.schema';

export type RoleDocument = Roles & Document;

@Schema({ timestamps: true })
export class Roles {
  @Prop({
    type: String,
  })
  role_name;

  @Prop({
    type: String,
  })
  role_description;

  @Prop({
    type: Boolean,
  })
  role_status;
  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Permission' }])
  permission: Permission[];
}

export const RoleSchema = SchemaFactory.createForClass(Roles);
