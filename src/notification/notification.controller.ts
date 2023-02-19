import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReadNotificationDto } from './dto/read-notification.dto';

@ApiTags('Notification')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiBearerAuth()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }
  @Put('/read/:id')
  @ApiBearerAuth()
  readByUserId(
    @Param('id') id: string,
    @Body() readNotificationDto: ReadNotificationDto,
  ) {
    return this.notificationService.readByUserId(id, readNotificationDto);
  }

  // @Get()
  // findAll() {
  //   return this.notificationService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.notificationService.findOne(id);
  // }

  @Get('/user/:id')
  @ApiBearerAuth()
  findByUserId(@Param('id') id: string) {
    return this.notificationService.findByUserId(id);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateNotificationDto: UpdateNotificationDto,
  // ) {
  //   return this.notificationService.update(id, updateNotificationDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.notificationService.remove(id);
  // }
}
