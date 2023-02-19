import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDate,
} from 'class-validator';

export class CreateUserLeaveDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  leave_type: Array<string>;

  @ApiProperty()
  @IsNumber()
  //   @IsNotEmpty()
  leave_balance?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  user_id: string;
}
