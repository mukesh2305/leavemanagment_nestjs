import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
// import { EmergencyContactsDto } from './create-emergency-contact.dto';

export class UpdateEmergencyContactDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  relationship?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  contact_number?: string;
}
