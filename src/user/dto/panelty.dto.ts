import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class PaneltyDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  users: Array<string>;
}
