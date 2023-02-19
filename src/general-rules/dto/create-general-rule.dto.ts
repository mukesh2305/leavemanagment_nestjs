import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGeneralRuleDto {
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
