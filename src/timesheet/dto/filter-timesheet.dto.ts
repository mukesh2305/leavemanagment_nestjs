import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class FilterTimesheetDto {
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  keyword: string;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  createdAt: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  limit: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  skip: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  startDate: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  endDate: string;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  year: string;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  status: string;
}
