import { PartialType } from '@nestjs/swagger';
import { CreateTimesheetDto } from './create-timesheet.dto';
import { IsNotEmpty, IsString, IsMongoId, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTimesheetDto extends PartialType(CreateTimesheetDto) {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  project: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  task: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  custom: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  date: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  is_submitted;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  status;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  rejection_reason;
}
