// create deprtment schema
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

export type DepartmentDocument = Department & Document;

@Schema({ timestamps: true })
export class Department {
  @Prop({
    type: String,
    unique: true,
  })
  department_name;

  @Prop({
    type: String,
  })
  department_description;
  @Prop({
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
DepartmentSchema.plugin(mongoosePaginate);
