import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class FilterProjectDto {
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  keyword: string;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  status: string;

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
