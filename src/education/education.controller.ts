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
import { EducationService } from './education.service';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  employeeAuthorization,
  validatePermission,
} from 'src/helper/permission.helper';

@ApiTags('Education')
@Controller('education')
export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  @Post()
  @ApiBearerAuth()
  create(@Body() createEducationDto: CreateEducationDto, @Request() req) {
    const permission = employeeAuthorization(req, createEducationDto.userId);
    if (permission) {
      return this.educationService.create(createEducationDto);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }

  @Get('user/:id')
  @ApiBearerAuth()
  findAll(@Param('id') id: string, @Request() req) {
    // const permission = validatePermission(req, 'VIEW_EDUCATION');
    // if (permission) {
    return this.educationService.findAll(id);
    // } else {
    //   return {
    //     status: 403,
    //     message: 'Access Denied',
    //   };
    // }
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.educationService.findOne(id);
  // }

  @Patch(':id')
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateEducationDto: UpdateEducationDto,
    @Request() req,
  ) {
    const educationData = await this.educationService.findOneForPermit(id);
    const permission = await employeeAuthorization(req, educationData.userId);
    if (permission) {
      return this.educationService.update(id, updateEducationDto);
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
    const educationData = await this.educationService.findOneForPermit(id);
    const permission = await employeeAuthorization(req, educationData.userId);
    if (permission) {
      return this.educationService.remove(id);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }
}
