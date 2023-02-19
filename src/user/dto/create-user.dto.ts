import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsDate,
  IsEmail,
  IsString,
  IsMongoId,
  IsEnum,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsString()
  emp_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  // @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
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
  @IsDate()
  date_of_birth: Date;

  // @ApiProperty()
  @IsNotEmpty()
  @IsString()
  reporting_manager: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  leave_rules: Array<any>;

  // @ApiProperty()
  @IsNotEmpty()
  @IsString()
  details?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  // @IsEnum(['yes', 'no'])
  is_fresher: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  designation: string;
}
