import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsMongoId,
} from 'class-validator';

export class FilterTicketDto {
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
  @IsMongoId()
  @IsNotEmpty()
  @IsOptional()
  user_id: string;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  track_id: string;

  //   @ApiPropertyOptional()
  //   @IsNumber()
  //   @IsNotEmpty()
  //   @IsOptional()
  //   endDate: string;

  //   @ApiPropertyOptional()
  //   @IsString()
  //   @IsNotEmpty()
  //   @IsOptional()
  //   year: string;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  status: string;
}
