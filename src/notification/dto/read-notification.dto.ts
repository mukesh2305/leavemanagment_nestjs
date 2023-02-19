import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsOptional,
  IsNumber,
  IsArray,
} from 'class-validator';

export class ReadNotificationDto {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  notifications: string[];
}
