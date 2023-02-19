import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsOptional,
  IsNumber,
  IsArray,
} from 'class-validator';

export class RenewLeaveDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  leave_type: string;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  users: Array<string>;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  leave_amount: number;
}
