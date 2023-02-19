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
import { CategoryLeaveService } from './category-leave.service';
import { CreateCategoryLeaveDto } from './dto/create-category-leave.dto';
import { UpdateCategoryLeaveDto } from './dto/update-category-leave.dto';
import { validatePermission } from 'src/helper/permission.helper';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FilterCategoryLeaveDto } from './dto/filter-category.dto';

@ApiTags('CategoryLeave')
@Controller('category-leave')
export class CategoryLeaveController {
  constructor(private readonly categoryLeaveService: CategoryLeaveService) {}

  @Post()
  @ApiBearerAuth()
  async create(
    @Request() req,
    @Body() createCategoryLeaveDto: CreateCategoryLeaveDto,
  ) {
    const permission = await validatePermission(req, 'CREATE_CATEGORY_LEAVE');
    if (permission) {
      return this.categoryLeaveService.create(createCategoryLeaveDto);
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
    // const permission = await validatePermission(req, 'VIEW_CATEGORY_LEAVE');
    // if (permission) {
    return this.categoryLeaveService.findAll();
    // } else {
    //   return {
    //     status: 403,
    //     message: 'Access Denied',
    //   };
    // }
  }

  @Get('filter')
  @ApiBearerAuth()
  filter(@Query() filterCategoryLeaveDto: FilterCategoryLeaveDto) {
    return this.categoryLeaveService.filter(filterCategoryLeaveDto);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const permission = await validatePermission(
      req,
      'VIEW_CATEGORY_LEAVE_BY_ID',
    );
    if (permission) {
      return this.categoryLeaveService.findOne(id);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }

  @Patch(':id')
  @ApiBearerAuth()
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateCategoryLeaveDto: UpdateCategoryLeaveDto,
  ) {
    const permission = await validatePermission(req, 'UPDATE_CATEGORY_LEAVE');
    if (permission) {
      return this.categoryLeaveService.update(id, updateCategoryLeaveDto);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }

  @Delete(':id')
  @ApiBearerAuth()
  async remove(@Request() req, @Param('id') id: string) {
    const permission = await validatePermission(req, 'DELETE_CATEGORY_LEAVE');
    if (permission) {
      return this.categoryLeaveService.remove(id);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }
}
