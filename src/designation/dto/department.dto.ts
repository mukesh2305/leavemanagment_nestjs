import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsOptional,
  IsNumber,
  IsObject,
  isMongoId,
  IsMongoId,
} from 'class-validator';

export class FilterDesignationDepartmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  department?: string;
}
