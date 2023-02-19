import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { CreateIssueDto } from './create-issue.dto';

export class UpdateIssueDto extends PartialType(CreateIssueDto) {
  @ApiProperty({
    description: 'Issue title',
    example: 'Experience letter',
  })
  @IsString()
  @IsOptional()
  issue: string;

  @ApiProperty({
    description: 'Is Date required',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  is_date: boolean;
}
