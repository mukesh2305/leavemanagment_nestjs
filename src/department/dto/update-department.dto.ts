import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateDepartmentDto } from './create-department.dto';

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {
  @ApiProperty()
  department_name?: string;

  @ApiProperty()
  department_description?: string;

  @ApiProperty()
  status?: string;
}
