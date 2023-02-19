import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
} from '@nestjs/common';
import { TimesheetService } from './timesheet.service';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { UpdateTimesheetDto } from './dto/update-timesheet.dto';
import { ApiTags } from '@nestjs/swagger';
import { FilterTimesheetDto } from './dto/filter-timesheet.dto';
import { SubmitTimesheetDto } from './dto/submit-timesheet.dto';
import { StatusTimesheetDto } from './dto/status-timesheet.dto';
import { Cron } from '@nestjs/schedule';

@ApiTags('Timesheet')
@Controller('timesheet')
export class TimesheetController {
  constructor(private readonly timesheetService: TimesheetService) {}

  @Post()
  create(@Body() createTimesheetDto: CreateTimesheetDto) {
    return this.timesheetService.create(createTimesheetDto);
  }

  @Get(':id')
  findAll(@Param('id') id: string, @Query() query: FilterTimesheetDto) {
    return this.timesheetService.findAll(id, query);
  }
  @Get('rm/:id')
  monthWiseTimesheet(
    @Param('id') id: string,
    @Query() query: FilterTimesheetDto,
  ) {
    return this.timesheetService.monthWiseTimesheet(id, query);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.timesheetService.findOne(id);
  // }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTimesheetDto: UpdateTimesheetDto,
  ) {
    return this.timesheetService.update(id, updateTimesheetDto);
  }
  @Patch('submit/:id')
  isSubmitted(@Param('id') id: string, @Query() query: SubmitTimesheetDto) {
    return this.timesheetService.isSubmitted(id, query);
  }
  @Patch('status/:id')
  statusUpdate(@Param('id') id: string, @Query() query: StatusTimesheetDto) {
    return this.timesheetService.statusUpdate(id, query);
  }

  @Cron('0 30 11 * * 1-5')
  async warningTimesheet() {
    return this.timesheetService.warningTimesheet();
  }
  @Cron('0 30 11 * * *')
  async remindTimesheetSubmit() {
    return this.timesheetService.remindTimesheetSubmit();
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.timesheetService.remove(id);
  // }
}
