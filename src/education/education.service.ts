import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Education, EducationDocument } from 'src/schemas/education.schema';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { Model } from 'mongoose';
import { createSuccessResponse } from 'src/helper/success.helper';
import { ErrorLog } from 'src/helper/error.helper';

@Injectable()
export class EducationService {
  constructor(
    @InjectModel(Education.name)
    private EducationModel: Model<EducationDocument>,
  ) {}

  async create(createEducationDto: CreateEducationDto) {
    try {
      const data = await this.EducationModel.create(createEducationDto);
      const successResponse = createSuccessResponse(
        'Education created successfully',
        data,
        'EDUCATION_CREATED',
      );
      return successResponse;
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        message: 'Error creating education',
        error: error.message,
      };
    }
  }

  async findOneForPermit(id: string) {
    return await this.EducationModel.findById(id);
  }

  async findAll(id: string) {
    try {
      const data = await this.EducationModel.find({ userId: id });
      const successResponse = createSuccessResponse(
        'Education list',
        data,
        'EDUCATION_LIST',
      );
      return successResponse;
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        message: 'something went wrong',
        error: error.message,
      };
    }
  }

  async findOne(id: string) {
    try {
      const data = await this.EducationModel.findById(id);
      const successResponse = createSuccessResponse(
        'Education list',
        data,
        'EDUCATION_LIST',
      );
      return successResponse;
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        message: 'something went wrong',
        error: error.message,
      };
    }
  }

  async update(id: string, updateEducationDto: UpdateEducationDto) {
    try {
      const data = await this.EducationModel.findByIdAndUpdate(
        id,
        updateEducationDto,
        { new: true },
      );
      const successResponse = createSuccessResponse(
        'Education updated successfully',
        data,
        'EDUCATION_UPDATED',
      );
      return successResponse;
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        message: 'something went wrong',
        error: error.message,
      };
    }
  }

  async remove(id: string) {
    try {
      const data = await this.EducationModel.findByIdAndDelete(id);
      const successResponse = createSuccessResponse(
        'Education deleted successfully',
        data,
        'EDUCATION_DELETED',
      );
      return successResponse;
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        message: 'something went wrong',
        error: error.message,
      };
    }
  }
}
