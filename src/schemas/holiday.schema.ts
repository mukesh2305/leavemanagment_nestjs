import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type HolidayDocument = Holidays & Document;

@Schema({ timestamps: true })
export class Holidays {
  @Prop({
    type: String,
    unique: true,
  })
  holiday_name;

  @Prop({
    type: Date,
    unique: true,
  })
  holiday_date;

  @Prop({
    type: String,
  })
  holiday_type;

  @Prop({
    type: String,
  })
  holiday_description;

  @Prop({
    type: String,
  })
  holiday_status;

  @Prop({
    type: String,
  })
  holiday_day;

  // @Prop({
  //     type: Date,
  // })
  // holiday_created_at;

  // @Prop({
  //     type: Date,
  // })
  // holiday_updated_at;
}

export const HolidaySchema = SchemaFactory.createForClass(Holidays);
