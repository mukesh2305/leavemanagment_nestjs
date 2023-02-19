import { PartialType } from '@nestjs/mapped-types';
import { CreateUserLeaveDto } from './create-user-leave.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDate,
} from 'class-validator';

export class UpdateUserLeaveDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  leave_type?: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  leave_balance?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  user_id?: string;
}
