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
import { EmergencyContactsService } from './emergency-contacts.service';
import { EmergencyContactsDto } from './dto/create-emergency-contact.dto';
import { UpdateEmergencyContactDto } from './dto/update-emergency-contact.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { employeeAuthorization } from 'src/helper/permission.helper';

@ApiTags('Emergency Contacts')
@Controller('emergency-contacts')
export class EmergencyContactsController {
  constructor(
    private readonly emergencyContactsService: EmergencyContactsService,
  ) {}

  @Post()
  @ApiBearerAuth()
  async create(
    @Body() EmergencyContactsDto: EmergencyContactsDto,
    @Request() req,
  ) {
    const permission = await employeeAuthorization(
      req,
      EmergencyContactsDto.userId,
    );
    if (permission) {
      return this.emergencyContactsService.create(EmergencyContactsDto);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }

  @Get('/:id')
  @ApiBearerAuth()
  findAll(@Param('id') id: string) {
    return this.emergencyContactsService.findAll(id);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.emergencyContactsService.findOne(+id);
  // }

  @Patch(':id')
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateEmergencyContactDto: UpdateEmergencyContactDto,
    @Request() req,
  ) {
    const emergencyContact =
      await this.emergencyContactsService.findOneForPermit(id);
    const permissions = await employeeAuthorization(
      req,
      emergencyContact.userId,
    );
    if (permissions) {
      return this.emergencyContactsService.update(
        id,
        updateEmergencyContactDto,
      );
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
    const emergencyContact =
      await this.emergencyContactsService.findOneForPermit(id);
    const permissions = await employeeAuthorization(
      req,
      emergencyContact.userId,
    );
    if (permissions) {
      return this.emergencyContactsService.remove(id);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }
}
