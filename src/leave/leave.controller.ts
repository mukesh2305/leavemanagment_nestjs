import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Request,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { LeaveService } from './leave.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { ApproveLeaveDto } from './dto/approve-leave.dto';
import { RejectLeaveDto } from './dto/reject-leave.dto';
import { query } from 'express';
import { FilterLeaveDto } from './dto/filter-leave.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  adminAuthorization,
  employeeAuthorization,
  validatePermission,
} from 'src/helper/permission.helper';

@ApiTags('Leave')
@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  @ApiBearerAuth()
  async create(@Body() createLeaveDto: CreateLeaveDto, @Request() req) {
    const permission = await employeeAuthorization(
      req,
      createLeaveDto.applied_by,
    );
    if (permission) {
      return this.leaveService.create(createLeaveDto);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }

  @Get()
  @ApiBearerAuth()
  findAll() {
    return this.leaveService.findAll();
  }
  @Get('filter')
  @ApiBearerAuth()
  filterLeaves(@Query() filterLeaveDto: FilterLeaveDto) {
    return this.leaveService.filterLeaves(filterLeaveDto);
  }

  @Get('email')
  @ApiBearerAuth()
  async email(@Request() req) {
    const permissions = await validatePermission(req, 'LEAVE_EMAIL');
    if (permissions) {
      return this.leaveService.email();
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }

  @Get('filter-rm/:id')
  @ApiBearerAuth()
  filterLeavesReportingManager(
    @Param('id') id: string,
    @Query() filterLeaveDto: FilterLeaveDto,
  ) {
    return this.leaveService.filterLeavesReportingManager(id, filterLeaveDto);
  }

  @Get('all-leaves')
  @ApiBearerAuth()
  getAllLeave() {
    return this.leaveService.getAllLeaves();
  }

  @Get('all-leaves-rm/:id')
  @ApiBearerAuth()
  getFutureAndTodayLeave(@Param('id') id: string) {
    return this.leaveService.getFutureAndTodayLeave(id);
  }

  @Get('today-leaves')
  @ApiBearerAuth()
  todayLeave() {
    return this.leaveService.todayLeave();
  }

  @Get('download')
  @ApiBearerAuth()
  downloadLeaveList() {
    return this.leaveService.downloadLeaveList();
  }

  @Get('download/:id')
  @ApiBearerAuth()
  downloadLeaveDataForRM(@Param('id') id: string) {
    return this.leaveService.downloadLeaveDataForRM(id);
  }

  @Get(':id')
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.leaveService.findOne(id);
  }

  @Get('user/:id')
  @ApiBearerAuth()
  findLeaveByUserId(@Param('id') id: string) {
    return this.leaveService.findLeaveByUserId(id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  async remove(@Param('id') id: string, @Request() req) {
    const leaveData = await this.leaveService.findOneForPermission(id);
    const permission = await employeeAuthorization(req, leaveData.applied_by);
    if (permission) {
      return this.leaveService.remove(id);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }

  @Post('/approve/:id')
  @ApiBearerAuth()
  async approveLeave(
    @Param('id') id: string,
    @Body() approveLeaveDto: ApproveLeaveDto,
    @Request() req,
  ) {
    const permissions = await validatePermission(req, 'LEAVE_APPROVE');
    console.log(permissions, 'permissions');
    if (permissions) {
      return this.leaveService.approve(id, approveLeaveDto);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }

  @Post('/pending/:id')
  @ApiBearerAuth()
  async pending(
    @Param('id') id: string,
    @Request() req,
    // @Body() approveLeaveDto: ApproveLeaveDto,
  ) {
    const permissions = await validatePermission(req, 'LEAVE_PENDING');
    if (permissions) {
      return this.leaveService.pending(id);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }
  @Post('/pending-rm/:id')
  @ApiBearerAuth()
  async pendingByRm(
    @Param('id') id: string,
    // @Body() approveLeaveDto: ApproveLeaveDto,
    @Request() req,
  ) {
    const permissions = await adminAuthorization(req);
    if (permissions) {
      return this.leaveService.pendingByRm(id);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }

  @Post('/approve-by-reporting-manager/:id')
  @ApiBearerAuth()
  async approveByReportingManager(
    @Param('id') id: string,
    @Body() approveLeaveDto: ApproveLeaveDto,
    @Request() req,
  ) {
    const permissions = await adminAuthorization(req);
    if (permissions) {
      return this.leaveService.approveByReportingManager(id, approveLeaveDto);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }

  @Post('/reject-by-reporting-manager/:id')
  @ApiBearerAuth()
  async rejectByReportingManager(
    @Param('id') id: string,
    @Body() rejectLeaveDto: RejectLeaveDto,
    @Request() req,
  ) {
    const permissions = await adminAuthorization(req);
    if (permissions) {
      return this.leaveService.rejectByReportingManager(id, rejectLeaveDto);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }
  @Post('/reject/:id')
  @ApiBearerAuth()
  async rejectLeave(
    @Param('id') id: string,
    @Body() rejectLeaveDto: RejectLeaveDto,
    @Request() req,
  ) {
    const permissions = await validatePermission(req, 'LEAVE_REJECT');
    if (permissions) {
      return this.leaveService.reject(id, rejectLeaveDto);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }
}
