import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  department_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  department_description: string;
}
