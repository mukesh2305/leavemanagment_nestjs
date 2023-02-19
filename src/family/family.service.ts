import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Family, FamilyDocument } from 'src/schemas/family.schema';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { Model } from 'mongoose';
import { createSuccessResponse } from 'src/helper/success.helper';
import { ErrorLog } from 'src/helper/error.helper';

@Injectable()
export class FamilyService {
  constructor(
    @InjectModel(Family.name) private FamilyModel: Model<FamilyDocument>,
  ) {}

  async create(createFamilyDto: CreateFamilyDto) {
    try {
      const data = await this.FamilyModel.create(createFamilyDto);
      const successResponse = createSuccessResponse(
        'Family created successfully',
        data,
        'FAMILY_CREATED',
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

  async findAll(id: string) {
    try {
      const data = await this.FamilyModel.find({ userId: id });
      const successResponse = createSuccessResponse(
        'Family list',
        data,
        'FAMILY_LIST',
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
    return await this.FamilyModel.findById(id);
  }

  async update(id: string, updateFamilyDto: UpdateFamilyDto) {
    try {
      const data = await this.FamilyModel.findByIdAndUpdate(
        id,
        updateFamilyDto,
        { new: true },
      );
      const successResponse = createSuccessResponse(
        'Family updated successfully',
        data,
        'FAMILY_UPDATED',
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
      const data = await this.FamilyModel.findByIdAndRemove(id);
      const successResponse = createSuccessResponse(
        'Family deleted successfully',
        data,
        'FAMILY_DELETED',
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
