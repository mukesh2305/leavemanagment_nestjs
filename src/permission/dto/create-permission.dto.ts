import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty()
  permission_name: string;

  @ApiProperty()
  permission_description: string;
}
