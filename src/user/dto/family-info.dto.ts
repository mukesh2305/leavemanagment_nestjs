import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsDate,
  IsEmail,
  IsString,
  IsBoolean,
} from 'class-validator';

export class FamilyInfoDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  familyMemberName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  familyMemberRelationship: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  familyMemberDateOfBirth: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  familyMemberDependent: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  emergencyContactName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  emergencyContactRelationship: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  emergencyContactContactNumber: string;
}
