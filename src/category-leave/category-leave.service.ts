import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateCategoryLeaveDto } from './dto/create-category-leave.dto';
import { UpdateCategoryLeaveDto } from './dto/update-category-leave.dto';
import { MyLeaveDocument, LeaveType } from 'src/schemas/category.leave.schema';
import { Model } from 'mongoose';
import { createSuccessResponse } from 'src/helper/success.helper';
import { Users, UserDocument } from 'src/schemas/user.schema';
import { ErrorLog } from 'src/helper/error.helper';

@Injectable()
export class CategoryLeaveService {
  constructor(
    @InjectModel(LeaveType.name) private MyLeaveModel: Model<MyLeaveDocument>,
    @InjectModel(Users.name) private UserModel: Model<UserDocument>,
  ) {}

  async create(createCategoryLeaveDto: CreateCategoryLeaveDto) {
    try {
      const leaveTypeCheck = await this.MyLeaveModel.findOne({
        leave_type: createCategoryLeaveDto.leave_type,
      });
      if (!leaveTypeCheck) {
        createCategoryLeaveDto.leave_type =
          createCategoryLeaveDto.leave_type.trim();
        const data = await this.MyLeaveModel.create(createCategoryLeaveDto);
        const successResponse = await createSuccessResponse(
          'leave type created successfully',
          data,
          'LEAVE_TYPE_CREATED',
        );
        return successResponse;
      } else {
        return {
          status: false,
          message: 'leave type already exist',
        };
      }
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

  async findAll() {
    try {
      const data = await this.MyLeaveModel.find();
      const successResponse = await createSuccessResponse(
        'leave type fetched successfully',
        data,
        'LEAVE_TYPE_FETCHED',
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

  async filter(query: any) {
    try {
      const limit = query.limit || 5;
      const skip = query.skip || 0;
      const queryToPass = [];
      if (query) {
        queryToPass.push(
          {
            $match: {
              _id: { $exists: true },
            },
          },
          {
            $sort: {
              createdAt: query.createdAt ? 1 : -1,
            },
          },
        );
      }
      if (query.keyword) {
        queryToPass.push({
          $match: {
            $or: [
              {
                leave_type: {
                  $regex: query.keyword,
                  $options: 'i',
                },
              },
            ],
          },
        });
      }
      if (query.status) {
        queryToPass.push({
          $match: {
            status: query.status,
          },
        });
      }
      queryToPass.push({
        $facet: {
          result: [{ $skip: parseInt(skip) }, { $limit: parseInt(limit) }],
          totalCount: [
            {
              $count: 'count',
            },
          ],
        },
      });
      const contactUs = await this.MyLeaveModel.aggregate(queryToPass);
      const successResponse = await createSuccessResponse(
        'contactUs found successfully',
        contactUs,
        'Form submitted successfully',
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
      const data = await this.MyLeaveModel.findById(id);
      const successResponse = await createSuccessResponse(
        'leave type fetched successfully',
        data,
        'LEAVE_TYPE_FETCHED',
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

  async update(id: string, updateCategoryLeaveDto: UpdateCategoryLeaveDto) {
    try {
      const data = await this.MyLeaveModel.findByIdAndUpdate(
        id,
        updateCategoryLeaveDto,
        { new: true },
      );
      const successResponse = await createSuccessResponse(
        'leave type updated successfully',
        data,
        'LEAVE_TYPE_UPDATED',
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
      const user = await this.UserModel.find({ leave_category: id });
      console.log(user);
      if (user.length > 0 && user) {
        const successResponse = await createSuccessResponse(
          'leave type has users',
          {},
          'LEAVE_TYPE_HAS_USERS',
        );
        return successResponse;
      } else {
        const data = await this.MyLeaveModel.findByIdAndDelete(id);
        const successResponse = await createSuccessResponse(
          'leave type deleted successfully',
          data,
          'LEAVE_TYPE_DELETED',
        );
        return successResponse;
      }
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
