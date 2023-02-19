import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create-role.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @ApiProperty()
  role_name?: string;

  @ApiProperty()
  role_description?: string;

  @ApiProperty()
  role_status?: boolean;
  // permission?: array;
}
