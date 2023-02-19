import { PartialType } from '@nestjs/mapped-types';
import { CreatePermissionDto } from './create-permission.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {
  @ApiProperty()
  permission_name?: string;

  @ApiProperty()
  permission_description?: string;
}
