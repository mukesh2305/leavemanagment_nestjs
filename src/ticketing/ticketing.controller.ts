import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { TicketingService } from './ticketing.service';
import { CreateTicketingDto } from './dto/create-ticketing.dto';
import { UpdateTicketingDto } from './dto/update-ticketing.dto';
import { FilterTicketDto } from './dto/filter-ticketing.dto';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor, MulterModule } from '@nestjs/platform-express';
import { multerOptions } from 'src/helper/file.upload.helper';

@ApiTags('Ticket')
@Controller('ticketing')
export class TicketingController {
  constructor(private readonly ticketingService: TicketingService) {}

  @Post()
  create(@Body() createTicketingDto: CreateTicketingDto) {
    return this.ticketingService.create(createTicketingDto);
  }

  @Get()
  findAll(@Query() query: FilterTicketDto) {
    return this.ticketingService.findAll(query);
  }
  @Get('allTicket')
  findAllTickets(@Query() query: FilterTicketDto) {
    return this.ticketingService.findAllTickets(query);
  }
  @Get('allTicket/rm/:id')
  findAllTicketsRm(@Param('id') id: string, @Query() query: FilterTicketDto) {
    return this.ticketingService.findAllTicketsRm(id, query);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.ticketingService.findOne(id);
  // }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        comment: { type: 'string' },
        documents: {
          type: 'array', // 👈  array of files
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('documents', 20, multerOptions))
  update(
    @Param('id') id: string,
    @Body() updateTicketingDto: UpdateTicketingDto,
    @UploadedFiles() documents: Array<Express.Multer.File>,
  ) {
    // console.log(documents, 'doc');
    return this.ticketingService.update(id, updateTicketingDto, documents);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketingService.remove(id);
  }
}
