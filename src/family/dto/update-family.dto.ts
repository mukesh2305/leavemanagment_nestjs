import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsNotEmpty, IsString } from 'class-validator';
import { CreateFamilyDto } from './create-family.dto';

export class UpdateFamilyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  relationship: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  date_of_birth: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  dependent: boolean;
}
