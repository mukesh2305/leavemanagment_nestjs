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
  IsUrl,
} from 'class-validator';

export class PersonalInfoDto {
  @ApiProperty({ example: 'ram' })
  @IsNotEmpty()
  @IsString()
  first_name?: string;

  @ApiProperty({ example: 'vipul' })
  @IsNotEmpty()
  @IsString()
  last_name?: string;

  @ApiProperty({ example: 'male/female' })
  @IsNotEmpty()
  @IsString()
  gender?: string;

  @ApiProperty({ example: '2000-09-23' })
  @IsNotEmpty()
  @IsDate()
  date_of_birth?: Date;

  @ApiProperty({ example: 'A+' })
  @IsNotEmpty()
  @IsString()
  blood_group?: string;

  @ApiProperty({ example: 'married/unmarried/devorced' })
  @IsNotEmpty()
  @IsString()
  marital_status?: string;

  @ApiProperty({ example: '["english","gujarati"]' })
  @IsNotEmpty()
  @IsString()
  language?: Array<string>;

  @ApiProperty({ example: '180 abc society, ahmedabad, gujarat, 360002' })
  @IsNotEmpty()
  @IsString()
  home_address?: string;

  @ApiProperty({ example: '180 abc society, ahmedabad, gujarat, 360002' })
  @IsNotEmpty()
  @IsString()
  communication_address?: string;

  @ApiProperty({ example: 'latituderhr@gmail.com' })
  @IsNotEmpty()
  @IsString()
  personal_email?: string;

  @ApiProperty({ example: '9876789856' })
  @IsNotEmpty()
  @IsString()
  contact_number?: string;

  @ApiProperty({ example: '["https://www.linkedin.com/"]' })
  @IsNotEmpty()
  social_profiles?: Array<string>;

  @ApiProperty({ example: 'https://www.twitter.com/' })
  @IsNotEmpty()
  @IsUrl()
  twitter_url?: string;

  @ApiProperty({ example: 'https://www.facebook.com/' })
  @IsNotEmpty()
  @IsUrl()
  facebook_url?: string;

  @ApiProperty({ example: 'https://www.linkedin.com/' })
  @IsNotEmpty()
  @IsUrl()
  linkedin_url?: string;
}
