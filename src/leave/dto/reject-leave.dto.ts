import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class RejectLeaveDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  approved_by: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  rejection_reason: string;
}
