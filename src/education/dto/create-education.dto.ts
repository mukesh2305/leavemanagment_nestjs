import { PartialType, ApiProperty } from '@nestjs/swagger';

import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsDate,
  IsEmail,
  IsString,
} from 'class-validator';

export class CreateEducationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  qualificationType: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  courseName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  stream: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  courseType: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  courseStartDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  courseEndDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  collegeName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  universityName: string;
}
