import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class EmergencyContactsDto {
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
  @IsString()
  contact_number: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  userId: string;
}
