import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UploadedFile,
  UseInterceptors,
  Put,
  Query,
  Render,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserLeaveDto } from 'src/user-leave/dto/update-user-leave.dto';
import { AssignLeaveUserDto } from './dto/assign-leave-user-dto';
import { PersonalInfoDto } from './dto/personal-info.dto';
import { EducationDto } from './dto/education-data.dto';
import { WorkDto } from './dto/work-user.dto';
import { TeamDto } from './dto/team.dto';
import { FamilyInfoDto } from './dto/family-info.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileInterceptor, MulterModule } from '@nestjs/platform-express';
import { multerOptions } from 'src/helper/file.upload.helper';
import { Express } from 'express';
import { EmergencyContactsDto } from './dto/emergency-contact';
import { FilterUserDto } from './dto/filter-user.dto';
import { validatePermission } from 'src/helper/permission.helper';
import { Cron } from '@nestjs/schedule';
import { RoleDto } from './dto/Role.dto';
import { PaneltyDto } from './dto/panelty.dto';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('avtar/:id')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('avtar', multerOptions))
  avtar(
    @Request() req,
    @Param('id') id,
    @UploadedFile() avtar: Express.Multer.File,
  ) {
    if (avtar) {
      return this.userService.avtar(id, avtar);
    }
    return {
      status: false,
      message: 'Please upload avtar',
    };
  }
  @Post('import')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('users', multerOptions))
  async importUsers(
    @Request() req,
    // @Param('id') id,
    @UploadedFile() users: Express.Multer.File,
  ) {
    const permission = await validatePermission(req, 'IMPORT_USERS');
    if (permission) {
      if (users) {
        return this.userService.importUsers(users);
      }
      return {
        status: false,
        message: 'Please upload csv',
      };
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }
  @Post('import-user')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('users', multerOptions))
  async importUsersWithBalance(
    @Request() req,
    // @Param('id') id,
    @UploadedFile() users: Express.Multer.File,
  ) {
    const permission = await validatePermission(req, 'IMPORT_USERS');
    if (permission) {
      if (users) {
        return this.userService.importUsersWithBalance(users);
      }
      return {
        status: false,
        message: 'Please upload csv',
      };
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }

  @Get('reporting-manager')
  @ApiBearerAuth()
  adminSuperAdmin(@Request() req, @Query() query: RoleDto): any {
    return this.userService.adminSuperAdmin(query);
  }
  @Get('download')
  @ApiBearerAuth()
  downloadUserList(@Query() query: any, @Request() req): any {
    return this.userService.downloadUserList(query);
  }
  @Get('filter')
  @ApiBearerAuth()
  filterUserList(@Query() filterUserDto: FilterUserDto, @Request() req): any {
    return this.userService.filterUserList(filterUserDto);
  }
  @Post()
  @ApiBearerAuth()
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    const permission = await validatePermission(req, 'ADD_USER');
    if (permission) {
      return this.userService.create(createUserDto);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }
  @Post('/add-super-admin')
  // @ApiBearerAuth()
  addSuperAdmin(@Body() createUserDto: CreateUserDto) {
    return this.userService.addSuperAdmin(createUserDto);
  }

  @Post('/forgot-password')
  @ApiBearerAuth()
  forgotPassword(@Body() body: any) {
    return this.userService.forgotPassword(body);
  }
  @Post('/reset-password/:token')
  @ApiBearerAuth()
  resetPassword(@Param('token') token, @Body() body: any) {
    return this.userService.resetPassword(body, token);
  }
  @Post('/reset-panelty/:id')
  @ApiBearerAuth()
  async clearPanelty(@Param('id') id: string, @Request() req: any) {
    const permissions = await validatePermission(req, 'EDIT_USER');
    if (permissions) {
      return this.userService.clearPanelty(id);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }
  @Post('/penalty')
  @ApiBearerAuth()
  async clearPaneltyOfMultipleUser(
    @Body() body: PaneltyDto,
    @Request() req: any,
  ) {
    const permissions = await validatePermission(req, 'EDIT_USER');
    if (permissions) {
      return this.userService.clearPaneltyOfMultipleUser(body);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }
  @Post('/personal-info/:id')
  @ApiBearerAuth()
  updatePersonalInfo(
    @Param('id') id: string,
    @Body() personalInfoDto: PersonalInfoDto,
  ) {
    return this.userService.updatePersonalInfo(id, personalInfoDto);
  }
  @Post('/work-info/:id')
  @ApiBearerAuth()
  workUpdate(@Param('id') id: string, @Body() workDto: WorkDto) {
    return this.userService.updateWork(id, workDto);
  }
  @Get()
  @ApiBearerAuth()
  findAll() {
    return this.userService.findAll();
  }
  // @Get('/test')
  // @ApiBearerAuth()
  @Cron('58 59 23 * * *')
  probationPeriod() {
    return this.userService.probationPeriod();
  }

  @Get(':id')
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }
  @Get('/user-under-manager/:id')
  @ApiBearerAuth()
  userUnderManager(@Param('id') id: string) {
    return this.userService.userUnderManager(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    // const permissions = await validatePermission(id, 'EDIT_USER');
    return this.userService.update(id, updateUserDto);
  }
  @Patch('/active-inactive/:id')
  @ApiBearerAuth()
  async userActiveInactive(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req,
  ) {
    const permission = await validatePermission(req, 'ACTIVE_INACTIVE_USER');
    if (permission) {
      return this.userService.userActiveInactive(id, body);
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
    const permission = await validatePermission(req, 'DELETE_USER');
    if (permission) {
      return this.userService.remove(id);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }
  // @Get('admin')
  // @Render('index.hbs')
}
