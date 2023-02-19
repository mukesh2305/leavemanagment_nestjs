import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class FilterLeaveDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    example: 'for ascending send value else it will show descending',
  })
  @IsOptional()
  @IsString()
  createdAt?: string;

  @ApiPropertyOptional({ example: 'Leave for particular user' })
  @IsOptional()
  @IsString()
  applied_by?: string;
  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsString()
  // reporting_manager?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  skip?: number;
}
