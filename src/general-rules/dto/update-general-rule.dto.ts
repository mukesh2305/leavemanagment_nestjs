import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateGeneralRuleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  rule_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  rule_description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  rule_type: string;
}
