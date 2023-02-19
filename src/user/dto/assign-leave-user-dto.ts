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

export class AssignLeaveUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  leave_category: string[];
}
