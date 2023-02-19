import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateTimesheetDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  user_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  project: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  task: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  custom: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  date: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  type: string;
}
