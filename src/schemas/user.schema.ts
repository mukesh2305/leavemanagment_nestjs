import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { LeaveType } from './category.leave.schema';
import { Roles } from './role.schema';
import { Department } from './department.schema';
import { Designation } from './designation.schema';

export type UserDocument = Users & Document;

///////////////////////////////////////////////////////////////////////USER INFO//////////////////////////////////////////////////////////////////
@Schema({ timestamps: true })
export class Users {
  @Prop({ required: true })
  first_name: string;

  @Prop({ required: true })
  emp_id: string;

  @Prop({ required: true })
  last_name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Department',
  })
  department_id: Department;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Users', default: null })
  reporting_manager: string;

  @Prop({ required: true })
  leave_rules: Array<LeaveType>;

  @Prop()
  details: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Roles',
  })
  user_role: Roles;

  @Prop({ type: String, enum: ['yes', 'no'] })
  is_fresher: string;

  @Prop({ required: true })
  join_date: Date;

  @Prop({
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: string;

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'LeaveType' }])
  leave_category: LeaveType[];

  @Prop({ default: 0 })
  panelty: number;

  @Prop({ default: 0 })
  carry: number;

  @Prop({ type: String })
  location: string;
  @Prop({ type: String })
  avtar: string;

  @Prop({
    type: String,
    enum: ['male', 'female'],
  })
  gender;
  @Prop({
    type: Date,
  })
  date_of_birth;
  @Prop({
    type: String,
  })
  blood_group;
  @Prop({
    type: String,
    enum: ['married', 'unmarried', 'devorced'],
    default: 'unmarried',
  })
  marital_status;
  @Prop({
    type: Array,
    default: [],
  })
  language;
  @Prop({
    type: String,
  })
  home_address;
  @Prop({
    type: String,
  })
  communication_address;
  @Prop({
    type: String,
  })
  personal_email;
  @Prop({
    type: String,
  })
  contact_number;

  @Prop({
    type: Array,
  })
  social_profiles;

  //work
  @Prop({
    type: String,
  })
  twitter_url: string;
  @Prop({
    type: String,
  })
  facebook_url: string;
  @Prop({
    type: String,
  })
  linkedin_url: string;

  @Prop({
    type: String,
  })
  probation_period;

  @Prop({
    type: String,
    enum: ['full-time', 'part-time'],
  })
  employee_type;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Designation',
  })
  designation: Designation;
  @Prop({
    type: String,
  })
  job_title;
}

export const UsersSchema = SchemaFactory.createForClass(Users);
