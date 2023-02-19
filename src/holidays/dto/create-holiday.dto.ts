import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHolidayDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  holiday_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  holiday_date: string;

  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  // @IsOptional()
  // holiday_type: string;

  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  // @IsOptional()
  // holiday_description: string;

  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  // @IsOptional()
  // holiday_status: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  holiday_day?: string;

  // @IsString()
  // @IsNotEmpty()
  // @IsOptional()
  // holiday_created_at: string;

  // @IsString()
  // @IsNotEmpty()
  // @IsOptional()
  // holiday_updated_at: string;
}
