import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAttendenceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  user_id: string;

  // @ApiProperty()
  // @IsDate()
  // @IsNotEmpty()
  // date: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  location: string;

  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  // is_clockin: string;

  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  // cid;
}
