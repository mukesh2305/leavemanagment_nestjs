import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignRemovePermissionDto } from './dto/assign-remove-permission.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Role')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  // @Post()
  // @ApiBearerAuth()
  // create(@Body() createRoleDto: CreateRoleDto) {
  //   return this.roleService.create(createRoleDto);
  // }

  @Get()
  @ApiBearerAuth()
  findAll(@Query() query: any) {
    return this.roleService.findAll(query);
  }
  // @Get('/download')
  // @ApiBearerAuth()
  // findAllAndDownload() {
  //   return this.roleService.findAllAndDownload();
  // }

  @Get(':id')
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  // @Patch(':id')
  // @ApiBearerAuth()
  // update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
  //   return this.roleService.update(id, updateRoleDto);
  // }
  // @Post('add-permission/:id')
  // @ApiBearerAuth()
  // addPermission(
  //   @Param('id') id: string,
  //   @Body() assignRemovePermissionDto: AssignRemovePermissionDto,
  // ) {
  //   return this.roleService.addPermissionToRole(id, assignRemovePermissionDto);
  // }
  // @Post('remove-permission/:id')
  // @ApiBearerAuth()
  // removePermission(
  //   @Param('id') id: string,
  //   @Body() assignRemovePermissionDto: AssignRemovePermissionDto,
  // ) {
  //   return this.roleService.removePermissionToRole(
  //     id,
  //     assignRemovePermissionDto,
  //   );
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.roleService.remove(id);
  // }
}
