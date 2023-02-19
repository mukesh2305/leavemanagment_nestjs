import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import * as fs from 'fs';
import { promisify } from 'util';
import { DocUpload, DocUploadDocument } from 'src/schemas/document.schema';
import { createSuccessResponse } from 'src/helper/success.helper';
import { ErrorLog } from 'src/helper/error.helper';

const UnlinkDocument = promisify(fs.unlink);

@Injectable()
export class DocumentService {
  constructor(
    @InjectModel(DocUpload.name)
    private docUploadModel: Model<DocUploadDocument>,
  ) {}
  async create(
    createDocumentDto: CreateDocumentDto,
    file: Express.Multer.File,
  ) {
    try {
      console.log(file.filename, 'file22');
      createDocumentDto.doc_url = `${file.filename}`;
      const data = await this.docUploadModel.create(createDocumentDto);
      const successResponse = await createSuccessResponse(
        'Document created successfully',
        data,
        'DOCUMENT_CREATED',
      );
      return successResponse;
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      UnlinkDocument('uploads/' + file.filename);
      return {
        status: false,
        message: 'Something went wrong',
        error: error,
      };
    }
  }

  async findAll() {
    try {
      const data = await this.docUploadModel.find();
      if (data) {
        const successResponse = createSuccessResponse(
          'Document list',
          data,
          'DOCUMENT_LIST',
        );
        return successResponse;
      } else {
        const successResponse = createSuccessResponse(
          'No Document found',
          {},
          'NO_DOCUMENT_FOUND',
        );
        return successResponse;
      }
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        message: 'Something went wrong',
        error: error,
      };
    }
  }

  async findOne(id: string) {
    return await this.docUploadModel.findById(id);
  }
  async findDocumentByUser(id: string) {
    try {
      const data = await this.docUploadModel
        .find({ user_id: id })
        .populate('doc_uploaded_by');
      if (data) {
        const successResponse = createSuccessResponse(
          'Document list',
          data,
          'DOCUMENT_LIST',
        );
        return successResponse;
      } else {
        const successResponse = createSuccessResponse(
          'No Document found',
          {},
          'NO_DOCUMENT_FOUND',
        );
        return successResponse;
      }
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        message: 'Something went wrong',
        error: error,
      };
    }
  }

  async update(
    id: string,
    updateDocumentDto: UpdateDocumentDto,
    file: Express.Multer.File,
  ) {
    try {
      const oldDocData = await this.docUploadModel.findById(id);
      // const oldDocUrl = oldDocData.doc_url;
      // UnlinkDocument(oldDocUrl);
      if (file && file.filename) {
        updateDocumentDto.doc_url = `${file.filename}`;
      }

      const data = await this.docUploadModel.findByIdAndUpdate(
        id,
        updateDocumentDto,
        { new: true },
      );

      const successResponse = createSuccessResponse(
        'Document updated successfully',
        data,
        'DOCUMENT_UPDATED',
      );
      return successResponse;
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        message: 'Something went wrong',
        error: error,
      };
    }
  }

  async remove(id: string) {
    try {
      const data = await this.docUploadModel.findByIdAndRemove(id);
      const successResponse = createSuccessResponse(
        'Document deleted successfully',
        data,
        'DOCUMENT_DELETED',
      );
      return successResponse;
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        message: 'Something went wrong',
        error: error,
      };
    }
  }
}
