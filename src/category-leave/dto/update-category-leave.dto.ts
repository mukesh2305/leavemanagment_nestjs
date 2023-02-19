import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateCategoryLeaveDto } from './create-category-leave.dto';

export class UpdateCategoryLeaveDto extends PartialType(
  CreateCategoryLeaveDto,
) {
  @ApiProperty()
  leave_type?: string;

  @ApiProperty()
  leave_balance?: number;

  @ApiProperty()
  leave_description?: string;

  @ApiProperty()
  status?: string;
}
