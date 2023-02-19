import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsMongoId,
} from 'class-validator';

export class CreateTicketingDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  message: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  comment: string;

  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  issue: string;

  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  end_date: string;
}
