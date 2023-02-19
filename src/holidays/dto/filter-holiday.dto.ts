import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class FilterHolidayDto {
  //   @ApiPropertyOptional()
  //   @IsOptional()
  //   @IsString()
  //   department_name?: string;
  @ApiPropertyOptional()
  @IsOptional()
  createdAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  future?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  skip?: number;
}
