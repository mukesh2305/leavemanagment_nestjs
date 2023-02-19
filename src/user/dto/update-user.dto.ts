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
} from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  last_name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  department_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  user_role: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  join_date: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  reporting_manager: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  leave_rules: Array<string>;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  details: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  user_details: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  status: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  leave_category: string[];

  @ApiProperty()
  @IsNotEmpty()
  carry: number;

  @ApiProperty()
  @IsNotEmpty()
  panelty: number;
}
