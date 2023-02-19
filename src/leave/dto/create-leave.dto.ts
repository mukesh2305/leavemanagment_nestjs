import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateLeaveDto {
  @ApiProperty({ example: 'sick/casual/loss-of-pay' })
  @IsString()
  @IsNotEmpty()
  leave_type: string;

  // @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  leave_amount: number;

  // @ApiProperty()
  @IsString()
  @IsNotEmpty()
  user_leave_id: string;

  @ApiProperty({ example: 'user id' })
  @IsString()
  @IsNotEmpty()
  applied_by: string;

  @ApiProperty({ example: 'first-half/second-half/full-day' })
  @IsString()
  @IsNotEmpty()
  startDateLeaveType: string;

  @ApiProperty({ example: 'first-half/second-half/full-day' })
  @IsString()
  @IsNotEmpty()
  endDateLeaveType: string;

  @ApiProperty({ example: '2020-05-01' })
  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({ example: '2020-05-01' })
  @IsDate()
  @IsNotEmpty()
  endDate: Date;

  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  // user_id: string;

  @ApiProperty({ example: 'function event ....' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  // status: string;

  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  // approved_by: string;

  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  // rejection_reason: string;
}
