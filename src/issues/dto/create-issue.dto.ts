import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsDate,
} from 'class-validator';

export class CreateIssueDto {
  @ApiProperty({
    description: 'Issue title',
    example: 'Experience letter',
  })
  @IsString()
  @IsOptional()
  issue: string;

  @ApiProperty({
    description: 'Is Date required',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  is_date: boolean;
}
