import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AttendenceService } from './attendence.service';
import { CreateAttendenceDto } from './dto/create-attendence.dto';
import { FilterAttendenceDto } from './dto/filter-attendence.dto';
import { UpdateAttendenceDto } from './dto/update-attendence.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { employeeAuthorization } from 'src/helper/permission.helper';
import { ExportAttendanceDto } from './dto/export-attendence.dto';

@Controller('attendence')
@ApiTags('Attendence')
export class AttendenceController {
  constructor(private readonly attendenceService: AttendenceService) {}

  @Post()
  @ApiBearerAuth()
  async create(
    @Body() createAttendenceDto: CreateAttendenceDto,
    @Request() req,
  ) {
    const permission = await employeeAuthorization(
      req,
      createAttendenceDto.user_id,
    );
    if (permission) {
      return this.attendenceService.create(createAttendenceDto);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }

  @Get()
  @ApiBearerAuth()
  findAll(@Query() query: FilterAttendenceDto) {
    return this.attendenceService.findAll(query);
  }
  @Get('rm/:id')
  @ApiBearerAuth()
  findAllByReportingManager(
    @Param('id') id: string,
    @Query() query: FilterAttendenceDto,
  ) {
    return this.attendenceService.findAllByReportingManager(id, query);
  }

  @Cron('59 59 23 * * *')
  getAttendence() {
    return this.attendenceService.getAttendence();
  }
  @Cron('0 30 23 * * 1-5')
  dayAnalysis() {
    return this.attendenceService.dayAnalysis();
  }
  @Cron('0 0 13 * * 1-5')
  missedClockInRemainder() {
    return this.attendenceService.missedClockInRemainder();
  }

  @Get('user/:id')
  @ApiBearerAuth()
  findOne(@Param('id') id: string, @Query() query: FilterAttendenceDto) {
    return this.attendenceService.findByUserId(id, query);
  }
  @Get('export/:id')
  @ApiBearerAuth()
  getAttendenceDownload(
    @Param('id') id: string,
    @Query() query: ExportAttendanceDto,
  ) {
    return this.attendenceService.getAttendenceDownload(id, query);
  }
  @Get('user/time/:id')
  @ApiBearerAuth()
  findLastTimeByUser(@Param('id') id: string) {
    return this.attendenceService.findLastTimeByUser(id);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateAttendenceDto: UpdateAttendenceDto,
  // ) {
  //   return this.attendenceService.update(id, updateAttendenceDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.attendenceService.remove(id);
  // }
}
