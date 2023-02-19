import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class RoleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  role?: string;
}
