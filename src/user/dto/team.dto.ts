import { PartialType, ApiProperty } from '@nestjs/swagger';
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
} from 'class-validator';

export class TeamDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  reportingManagerName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  reportingManagerType: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  reportingManagerDesignation: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  reportingManagerDepartment: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  directReportsName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  directReportsDesignation: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  directReportsDepartment: string;
}
