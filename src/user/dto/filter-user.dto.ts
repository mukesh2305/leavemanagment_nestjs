import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class FilterUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  createdAt?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  first_name?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  last_name?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  department?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reporting_manager?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  skip?: number;
}
