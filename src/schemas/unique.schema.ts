import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { string } from 'yargs';

export type UniqueDocument = Unique & Document;

@Schema({ timestamps: true })
export class Unique {
  // @Prop({
  //   type: MongooseSchema.Types.ObjectId,
  //   default: '62b40072ba0182defa98f7aa',
  // })
  // _id;

  @Prop({
    type: Number,
    default: 1,
    unique: true,
  })
  uniqueId;

  @Prop({
    type: Number,
  })
  unique: number;
}

export const UniqueSchema = SchemaFactory.createForClass(Unique);
