import { PartialType } from '@nestjs/swagger';
import { CreateLeaveDto } from './create-leave.dto';
import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLeaveDto extends PartialType(CreateLeaveDto) {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  leave_type: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  leave_amount: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  applied_by: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  startDateLeaveType: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  endDateLeaveType: string;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  endDate: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  user_leave_id: string;

  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  // user_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  approved_by: string;
}
