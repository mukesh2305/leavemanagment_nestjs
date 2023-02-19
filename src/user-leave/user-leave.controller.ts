import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Request,
  Delete,
} from '@nestjs/common';
import { UserLeaveService } from './user-leave.service';
import { CreateUserLeaveDto } from './dto/create-user-leave.dto';
import { UpdateUserLeaveDto } from './dto/update-user-leave.dto';
import { RemoveUserLeaveDto } from './dto/remove-user-leave.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { validatePermission } from 'src/helper/permission.helper';

@Controller('user-leave')
@ApiTags('User Leave')
export class UserLeaveController {
  constructor(private readonly userLeaveService: UserLeaveService) {}

  @Post('assign-leave')
  @ApiBearerAuth()
  async create(@Body() createUserLeaveDto: CreateUserLeaveDto, @Request() req) {
    const permissions = await validatePermission(req, 'CREATE_USER_LEAVE');
    if (permissions) {
      return this.userLeaveService.create(createUserLeaveDto);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }
  @Post('assign-leave-balance')
  @ApiBearerAuth()
  async createWithBalance(@Body() createUserLeaveDto: any, @Request() req) {
    const permissions = await validatePermission(req, 'CREATE_USER_LEAVE');
    if (permissions) {
      return this.userLeaveService.createWithBalance(createUserLeaveDto);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }
  @Post('remove-leave/:id')
  @ApiBearerAuth()
  async removeLeave(
    @Body() removeUserLeaveDto: RemoveUserLeaveDto,
    @Param('id') id: string,
    @Request() req,
  ) {
    const permissions = await validatePermission(req, 'DELETE_USER_LEAVE');
    if (permissions) {
      return this.userLeaveService.removeUserLeave(id, removeUserLeaveDto);
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
    return this.userLeaveService.findAll();
  }
  @Get('carry')
  @ApiBearerAuth()
  leavesBalance() {
    return this.userLeaveService.leavesBalance();
  }
  @Get('leaverules')
  @ApiBearerAuth()
  leaveRules() {
    return this.userLeaveService.leaveRules();
  }
  @Get('user-leave-amount/:id')
  @ApiBearerAuth()
  userLeaveBalance(@Param('id') id: string) {
    console.log(id, 'id');
    return this.userLeaveService.userLeaveBalance(id);
  }

  @Get('leave-type/:id')
  @ApiBearerAuth()
  findByLeaveType(@Param('id') id: string) {
    return this.userLeaveService.findByLeaveType(id);
  }
  @Get('user/:id')
  @ApiBearerAuth()
  findLeavesByUser(@Param('id') id: string) {
    return this.userLeaveService.findLeavesByUser(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateUserLeaveDto: UpdateUserLeaveDto,
  ) {
    const permissions = await validatePermission(req, 'UPDATE_USER_LEAVE');
    if (permissions) {
      return this.userLeaveService.update(id, updateUserLeaveDto);
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
    const permissions = await validatePermission(req, 'DELETE_USER_LEAVE');
    if (permissions) {
      return this.userLeaveService.remove(id);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }
}
