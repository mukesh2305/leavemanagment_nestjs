import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';
import { CreateEducationDto } from './create-education.dto';

export class UpdateEducationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  qualificationType: string;

  // @ApiProperty()
  // @IsNotEmpty()
  // @IsString()
  // userId: string;

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
