import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class StatusTimesheetDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  rejection_reason: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  endDate: string;
}
