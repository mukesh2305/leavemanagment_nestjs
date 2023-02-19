import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Request,
  Put,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { FileInterceptor, MulterModule } from '@nestjs/platform-express';
import { multerOptions } from 'src/helper/file.upload.helper';
import { Express } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  employeeAuthorization,
  validatePermission,
} from 'src/helper/permission.helper';

@ApiTags('Document')
@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async create(
    @Request() req,
    @Body() createDocumentDto: CreateDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const permission = await employeeAuthorization(
      req,
      createDocumentDto.user_id,
    );
    if (permission) {
      if (file) {
        console.log(file.filename, 'file');
        createDocumentDto.doc_url = file.filename;
        return this.documentService.create(createDocumentDto, file);
      } else {
        return {
          status: false,
          message: 'File must be uploaded',
        };
      }
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }

  // @Get()
  // async findAll(@Request() req) {
  //   const permission = await validatePermission(req, 'VIEW_DOCUMENT');
  //   if (permission) {
  //     return this.documentService.findAll();
  //   } else {
  //     return {
  //       status: 403,
  //       message: 'Access Denied',
  //     };
  //   }
  // }
  @Get('user/:id')
  @ApiBearerAuth()
  async findDocumentByUser(@Param('id') id: string, @Request() req) {
    // const permission = await validatePermission(req, 'VIEW_DOCUMENT_BY_USER');
    // if (permission) {
    return this.documentService.findDocumentByUser(id);
    // } else {
    //   return {
    //     status: 403,
    //     message: 'Access Denied',
    //   };
    // }
  }

  // @Get(':id')
  // async findOne(@Param('id') id: string, @Request() req) {
  //   const permission = await validatePermission(req, 'VIEW_DOCUMENT_BY_ID');
  //   // console.log(permission, 'permission');
  //   if (permission) {
  //     return this.documentService.findOne(id);
  //   } else {
  //     return {
  //       status: 403,
  //       message: 'Access Denied',
  //     };
  //   }
  // }

  @Put(':id')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    const permission = await employeeAuthorization(
      req,
      updateDocumentDto.user_id,
    );
    if (permission) {
      return this.documentService.update(id, updateDocumentDto, file);
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
    const userDoc = await this.documentService.findOne(id);

    const permission = await employeeAuthorization(req, userDoc.user_id);
    if (permission) {
      return this.documentService.remove(id);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }
}
