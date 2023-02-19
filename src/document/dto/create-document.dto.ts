import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateDocumentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  doc_url: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  main_doc_type: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  doc_uploaded_by: string;
  // verification_status: string;
  // verified_by: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sub_doc_type?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  doc_id?: string;

  @ApiProperty()
  @IsNotEmpty()
  proof?: Array<string>;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  doc_title?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  doc_description?: string;
}
