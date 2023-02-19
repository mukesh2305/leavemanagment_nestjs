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
import { filter } from 'rxjs';
import { validatePermission } from 'src/helper/permission.helper';
import { FilterLeaveDto } from 'src/leave/dto/filter-leave.dto';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { FilterDepartmentDto } from './dto/filter-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@ApiTags('Department')
@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @ApiBearerAuth()
  async create(
    @Body() createDepartmentDto: CreateDepartmentDto,
    @Request() req,
  ) {
    const permission = await validatePermission(req, 'CREATE_DEPARTMENT');
    if (permission) {
      return this.departmentService.create(createDepartmentDto);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }

  @Get()
  @ApiBearerAuth()
  async findAll(@Request() req) {
    // const permission = await validatePermission(req, 'VIEW_DEPARTMENT');
    // console.log(permission, 'permission');
    // if (permission) {
    return this.departmentService.findAll();
    // } else {
    //   return {
    //     status: 403,
    //     message: 'Access Denied',
    //   };
    // }
  }
  @Get('download')
  @ApiBearerAuth()
  async findAllAndDownload(@Request() req) {
    const permission = await validatePermission(req, 'VIEW_DEPARTMENT');
    console.log(permission, 'permission');
    if (permission) {
      return this.departmentService.findAllAndDownload();
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }
  @Get('filter')
  @ApiBearerAuth()
  async filterDepartment(
    @Request() req,
    @Query() filterDepartmentDto: FilterDepartmentDto,
  ) {
    const permission = await validatePermission(req, 'VIEW_DEPARTMENT');
    // console.log(permission, 'permission');
    if (permission) {
      return this.departmentService.filterDepartment(filterDepartmentDto);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }

  // @Get(':id')
  // async findOne(@Param('id') id: string, @Request() req) {
  //   const permission = await validatePermission(req, 'VIEW_DEPARTMENT_BY_ID');
  //   if (permission) {
  //     return this.departmentService.findOne(id);
  //   } else {
  //     return {
  //       status: 403,
  //       message: 'Access Denied',
  //     };
  //   }
  // }

  @Patch(':id')
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    const permission = await validatePermission(req, 'UPDATE_DEPARTMENT');
    if (permission) {
      return this.departmentService.update(id, updateDepartmentDto);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }

  @Patch('active-inactive/:id')
  @ApiBearerAuth()
  async activeInactiveDepartment(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @Request() req,
  ) {
    const permission = await validatePermission(req, 'ACTIVE_DEPARTMENT');
    if (permission) {
      return this.departmentService.activeInactiveDepartment(
        id,
        updateDepartmentDto,
      );
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
    const permission = await validatePermission(req, 'DELETE_DEPARTMENT');
    if (permission) {
      return this.departmentService.remove(id);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }
}
