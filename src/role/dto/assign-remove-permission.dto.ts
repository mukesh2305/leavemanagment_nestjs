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

export class AssignRemovePermissionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  permission: string[];
}
