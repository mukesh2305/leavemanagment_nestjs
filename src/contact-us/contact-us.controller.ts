import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { validatePermission } from 'src/helper/permission.helper';
import { ContactUsService } from './contact-us.service';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import { FilterContactUsDto } from './dto/filter-contact-us.dto';
import { UpdateContactUsDto } from './dto/update-contact-us.dto';

@ApiTags('Contact Us')
@Controller('contact-us')
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @Post()
  @ApiBearerAuth()
  create(@Body() createContactUsDto: CreateContactUsDto) {
    return this.contactUsService.create(createContactUsDto);
  }

  @Get()
  async findAll(@Query() query: FilterContactUsDto, @Request() req) {
    const permission = await validatePermission(req, 'VIEW_CONTACT_US');
    if (permission) {
      return this.contactUsService.findAll(query);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }

  @Get('/download')
  async downloadContactUs(@Request() req) {
    const permission = await validatePermission(req, 'DOWNLOAD_CONTACT_US');
    if (permission) {
      return this.contactUsService.downloadContactUs();
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }

  //   @Patch(':id')
  //   update(
  //     @Param('id') id: string,
  //     @Body() updateContactUsDto: UpdateContactUsDto,
  //   ) {
  //     return this.contactUsService.update(+id, updateContactUsDto);
  //   }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const permission = await validatePermission(req, 'DELETE_CONTACT_US');
    if (permission) {
      return this.contactUsService.remove(id);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }
}
