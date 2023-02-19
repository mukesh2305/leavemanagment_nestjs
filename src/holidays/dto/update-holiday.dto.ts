import { PartialType } from '@nestjs/mapped-types';
import { CreateHolidayDto } from './create-holiday.dto';

import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateHolidayDto extends PartialType(CreateHolidayDto) {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  holiday_name?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  holiday_date: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  holiday_type?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  holiday_description?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  holiday_status?: string;
}
