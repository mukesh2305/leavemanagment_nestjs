import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateDesignationDto {
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
