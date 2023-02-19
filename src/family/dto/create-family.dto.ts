import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { IsBoolean, IsDate, IsNotEmpty, IsString } from 'class-validator';

export class CreateFamilyDto {
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

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  userId: string;
}
