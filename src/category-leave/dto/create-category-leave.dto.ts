import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryLeaveDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  leave_type: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  leave_balance: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  leave_description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  status: string;
}
