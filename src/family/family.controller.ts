import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { FamilyService } from './family.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  employeeAuthorization,
  validatePermission,
} from 'src/helper/permission.helper';

@ApiTags('Family')
@Controller('family')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Post()
  @ApiBearerAuth()
  async create(@Body() createFamilyDto: CreateFamilyDto, @Request() req) {
    const permission = await employeeAuthorization(req, createFamilyDto.userId);
    if (permission) {
      return this.familyService.create(createFamilyDto);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }

  @Get('user/:id')
  @ApiBearerAuth()
  async findAll(@Param('id') id: string, @Request() req) {
    // const permission = await validatePermission(req, 'VIEW_FAMILY');
    // if (permission) {
    return this.familyService.findAll(id);
    // } else {
    //   return {
    //     status: 403,
    //     message: 'Access Denied',
    //   };
    // }
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.familyService.findOne(id);
  // }

  @Patch(':id')
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateFamilyDto: UpdateFamilyDto,
    @Request() req,
  ) {
    const familyInfo = await this.familyService.findOne(id);
    const permission = await employeeAuthorization(req, familyInfo.userId);
    if (permission) {
      return this.familyService.update(id, updateFamilyDto);
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
    const familyInfo = await this.familyService.findOne(id);
    const permission = await employeeAuthorization(req, familyInfo.userId);
    if (permission) {
      return this.familyService.remove(id);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }
}
