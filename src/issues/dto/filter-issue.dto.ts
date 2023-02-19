// dto for filter issues with
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class FilterIssueDto {
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
}
