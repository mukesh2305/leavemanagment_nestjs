import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class UpdateDesignationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  designation_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  designation_description: string;

  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  department: string;
}
