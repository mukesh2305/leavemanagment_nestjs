// import {IsString,} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  Matches,
  IsBoolean,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  role_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  role_description: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  role_status: boolean;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  permission: string[];
}
