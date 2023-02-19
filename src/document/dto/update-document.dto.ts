import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { CreateDocumentDto } from './create-document.dto';

export class UpdateDocumentDto {
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

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  verification_status?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  verified_by?: string;

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
