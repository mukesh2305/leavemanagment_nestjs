// permission schema
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type PermissionDocument = Permission & Document;

@Schema({ timestamps: true })
export class Permission {
  @Prop({
    type: String,
  })
  permission_name;

  // @Prop({
  //     type: String,
  // })
  // permission_name;

  @Prop({
    type: String,
  })
  permission_description;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
