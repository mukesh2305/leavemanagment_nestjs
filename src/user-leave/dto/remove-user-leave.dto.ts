import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDate,
} from 'class-validator';

export class RemoveUserLeaveDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  leave_type: Array<string>;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  user_id: string;
}
