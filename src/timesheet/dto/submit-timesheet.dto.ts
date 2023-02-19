import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class SubmitTimesheetDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  startDate: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  endDate: string;
}
