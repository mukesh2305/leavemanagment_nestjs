import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class ExportAttendanceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  month?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  year?: number;
}
