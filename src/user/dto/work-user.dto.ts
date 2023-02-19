import { PartialType, ApiProperty, ApiOperation } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsDate,
  IsEmail,
  IsString,
  IsBoolean,
  IsMongoId,
} from 'class-validator';

export class WorkDto {
  // @ApiProperty()
  // @IsNotEmpty()
  // @IsString()
  // employeeId:string

  @ApiProperty({ example: '180' })
  @IsNotEmpty()
  @IsString()
  probation_period: string;

  @ApiProperty({ example: 'rajkot' })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({ example: 'full-time/part-time' })
  @IsNotEmpty()
  @IsString()
  employee_type: string;

  @ApiProperty({ example: '2021-09-23' })
  @IsNotEmpty()
  @IsDate()
  join_date: Date;

  @ApiProperty({ example: 'active/inactive' })
  @IsNotEmpty()
  status: string;

  @ApiProperty({ description: 'experience flag', example: 'yes/no' })
  @IsNotEmpty()
  @IsString()
  is_fresher: string;

  @ApiProperty({ example: 'mongodb id' })
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  designation: string;

  @ApiProperty({ example: 'frontend' })
  @IsNotEmpty()
  @IsString()
  job_title: string;

  @ApiProperty({ example: 'mongodb id' })
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  department: string;

  // @ApiProperty()
  // @IsNotEmpty()
  // @IsString()
  // subDepartment: string;
}
