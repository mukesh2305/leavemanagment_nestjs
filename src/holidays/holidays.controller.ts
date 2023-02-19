import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Response,
  Query,
} from '@nestjs/common';
import { HolidaysService } from './holidays.service';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import { validatePermission } from 'src/helper/permission.helper';
import { NextFunction } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FilterHolidayDto } from './dto/filter-holiday.dto';

@ApiTags('Holidays')
@Controller('holidays')
export class HolidaysController {
  constructor(private readonly holidaysService: HolidaysService) {}

  // @UseGuards(JwtAuthGuard)/
  @Post()
  @ApiBearerAuth()
  // @Roles(Role.SuperAdmin)
  async create(@Request() req, @Body() createHolidayDto: CreateHolidayDto) {
    // if(req.user.role_name=="superAdmin"){
    // }
    const permission = await validatePermission(req, 'CREATE_HOLIDAY');
    console.log(permission, 'permission');
    if (permission) {
      const responseData = await this.holidaysService.create(createHolidayDto);
      return responseData;
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }

  // @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  findAll(@Request() req, @Query() query: FilterHolidayDto) {
    // const permission = validatePermission(req, 'VIEW_HOLIDAY');
    // if (permission) {
    return this.holidaysService.findAll(query);
    // } else {
    //   return {
    //     status: 403,
    //     message: 'Access Denied',
    //   };
    // }
  }
  @Get('/download')
  @ApiBearerAuth()
  async downloadHolidays(@Request() req) {
    const permission = await validatePermission(req, 'VIEW_HOLIDAY');
    if (permission) {
      return this.holidaysService.downloadHolidays();
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }

  // @UseGuards(JwtAuthGuard)
  // @Get(':id')
  // async findOne(@Request() req, @Param('id') id: string) {
  //   const permission = validatePermission(req, 'VIEW_HOLIDAY_BY_ID');
  //   if (permission) {
  //     return this.holidaysService.findOne(id);
  //   } else {
  //     return {
  //       status: 403,
  //       message: 'Access Denied',
  //     };
  //   }
  // }

  // @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth()
  // @Roles(Role.SuperAdmin)
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateHolidayDto: UpdateHolidayDto,
  ) {
    const permission = await validatePermission(req, 'UPDATE_HOLIDAY');
    if (permission) {
      return this.holidaysService.update(id, updateHolidayDto);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }

  // @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  // @Roles(Role.SuperAdmin)
  async remove(@Request() req, @Param('id') id: string) {
    const permission = await validatePermission(req, 'DELETE_HOLIDAY');
    if (permission) {
      return this.holidaysService.remove(id);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }
}
