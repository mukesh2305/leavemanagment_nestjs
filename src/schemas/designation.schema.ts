import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import { Department } from './department.schema';

export type DesignationDocument = Designation & Document;

@Schema({ timestamps: true })
export class Designation {
  @Prop({
    type: String,
  })
  designation_name;

  @Prop({
    type: String,
  })
  designation_description;

  //   @Prop({
  //     type: Boolean,
  //   })
  //   role_status;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Department' })
  department: Department;
}

export const DesignationSchema = SchemaFactory.createForClass(Designation);
