import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class ApproveLeaveDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  approved_by: string;
}
