import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { validatePermission } from 'src/helper/permission.helper';
import { Department } from 'src/schemas/department.schema';
import { DesignationService } from './designation.service';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { FilterDesignationDepartmentDto } from './dto/department.dto';
import { FilterDesignationDto } from './dto/filter-designation.dto';
import { UpdateDesignationDto } from './dto/update-designation.dto';

@ApiTags('Designation')
@Controller('designation')
export class DesignationController {
  constructor(private readonly designationService: DesignationService) {}

  @Post()
  @ApiBearerAuth()
  async create(
    @Body() createDesignationDto: CreateDesignationDto,
    @Request() req,
  ) {
    const permission = await validatePermission(req, 'CREATE_DESIGNATION');
    if (permission) {
      return this.designationService.create(createDesignationDto);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }

  @Get()
  @ApiBearerAuth()
  findAll(@Query() query: FilterDesignationDto) {
    return this.designationService.findAll(query);
  }

  @Get('all')
  @ApiBearerAuth()
  allDesignation(@Query() query: FilterDesignationDepartmentDto) {
    return this.designationService.allDesignation(query);
  }

  @Patch(':id')
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateDesignationDto: UpdateDesignationDto,
    @Request() req,
  ) {
    const permission = await validatePermission(req, 'UPDATE_DESIGNATION');
    if (permission) {
      return this.designationService.update(id, updateDesignationDto);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }

  @Delete(':id')
  @ApiBearerAuth()
  async remove(@Param('id') id: string, @Request() req) {
    const permission = await validatePermission(req, 'DELETE_DESIGNATION');
    console.log(permission, 'permission');
    if (permission) {
      return this.designationService.remove(id);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }
}
