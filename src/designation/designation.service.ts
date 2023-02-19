import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Designation,
  DesignationDocument,
} from 'src/schemas/designation.schema';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { UpdateDesignationDto } from './dto/update-designation.dto';
import { Model } from 'mongoose';
import { Department, DepartmentDocument } from 'src/schemas/department.schema';
import { createSuccessResponse } from 'src/helper/success.helper';
import { UserDocument, Users } from 'src/schemas/user.schema';
import { ErrorLog } from 'src/helper/error.helper';
import * as mongoose from 'mongoose';

@Injectable()
export class DesignationService {
  constructor(
    @InjectModel(Designation.name)
    private readonly designationModel: Model<DesignationDocument>,
    @InjectModel(Department.name)
    private readonly departmentModel: Model<DepartmentDocument>,
    @InjectModel(Users.name)
    private readonly usersModel: Model<UserDocument>,
  ) {}

  async create(createDesignationDto: CreateDesignationDto) {
    try {
      const departmentIdVerify = await this.departmentModel.findById(
        createDesignationDto.department,
      );
      if (departmentIdVerify) {
        createDesignationDto.designation_name =
          createDesignationDto.designation_name.trim();
        const designation = await this.designationModel.create(
          createDesignationDto,
        );
        const successResponse = await createSuccessResponse(
          'Designation Created Successfully',
          designation,
          'DESIGNATION_CREATED_SUCCESSFULLY',
        );
        return successResponse;
      } else {
        const errorResponse = await createSuccessResponse(
          'Department Not Found',
          null,
          'DEPARTMENT_NOT_FOUND',
        );
        return errorResponse;
      }
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        error: error,
        message: 'something went wrong',
      };
    }
  }

  async findAll(query: any) {
    try {
      const limit = query.limit || 5;
      const skip = query.skip || 0;

      const count = await this.designationModel
        .find(
          query.keyword
            ? {
                designation_name: query.keyword
                  ? {
                      $regex: query.keyword,
                      $options: 'i',
                    }
                  : { $exists: true },
              }
            : {},
        )
        .count();
      // console.log(count);

      const data = await this.designationModel
        .find(
          query.keyword
            ? {
                designation_name: query.keyword
                  ? {
                      $regex: query.keyword,
                      $options: 'i',
                    }
                  : { $exists: true },
              }
            : {},
        )
        .populate('department')
        .sort({ createdAt: query.createdAt ? 1 : -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));
      let finalData = {};
      const pushData = [];
      for (let i = 0; i < data.length; i++) {
        const user = await this.usersModel.find({
          designation: data[i]._id,
        });
        finalData = {
          designation: data[i],
          user: user,
        };
        pushData.push(finalData);
      }
      const allDesignation = {
        data: pushData,
        totalDepartments: count,
      };
      const successResponse = await createSuccessResponse(
        'designation fetch successfully',
        allDesignation,
        'DESIGNATION_FETCH',
      );
      return successResponse;
      // const queryToPass = [];
      // if (query) {
      //   queryToPass.push(
      //     {
      //       $match: {
      //         _id: { $exists: true },
      //       },
      //     },
      //     {
      //       $lookup: {
      //         from: 'departments',
      //         localField: 'department',
      //         foreignField: '_id',
      //         as: 'department',
      //       },
      //     },
      //     {
      //       $unwind: {
      //         path: '$department',
      //         preserveNullAndEmptyArrays: true,
      //       },
      //     },
      //   );
      // }
      // if (query.keyword) {
      //   queryToPass.push({
      //     $match: {
      //       $or: [
      //         {
      //           designation_name: {
      //             $regex: query.keyword,
      //             $options: 'i',
      //           },
      //         },
      //       ],
      //     },
      //   });
      // }
      // queryToPass.push({
      //   $facet: {
      //     result: [{ $skip: parseInt(skip) }, { $limit: parseInt(limit) }],
      //     totalCount: [
      //       {
      //         $count: 'count',
      //       },
      //     ],
      //   },
      // });
      // const data = await this.designationModel.aggregate(queryToPass);
      // const successResponse = await createSuccessResponse(
      //   'Designation list',
      //   data,
      //   'DESIGNATION_LIST',
      // );
      // return successResponse;
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        error: error,
        message: 'something went wrong',
      };
    }
  }

  async allDesignation(query: any) {
    try {
      const designation = await this.designationModel.find({
        department: query.department,
      });
      const successResponse = await createSuccessResponse(
        'Designation List',
        designation,
        'DESIGNATION_LIST',
      );
      return successResponse;
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        error: error,
        message: 'something went wrong',
      };
    }
  }

  async update(id: string, updateDesignationDto: UpdateDesignationDto) {
    try {
      const designation = await this.designationModel.findByIdAndUpdate(
        id,
        updateDesignationDto,
        { new: true },
      );
      const successResponse = await createSuccessResponse(
        'Designation Updated Successfully',
        designation,
        'DESIGNATION_UPDATED_SUCCESSFULLY',
      );
      return successResponse;
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        error: error,
        message: 'something went wrong',
      };
    }
  }

  async remove(id: string) {
    try {
      const designationCheck = await this.usersModel.find({ designation: id });
      console.log(designationCheck);
      if (!designationCheck || designationCheck.length == 0) {
        const designation = await this.designationModel.findByIdAndDelete(id);
        const successResponse = createSuccessResponse(
          'Designation Deleted Successfully',
          designation,
          'DESIGNATION_DELETED_SUCCESSFULLY',
        );
        return successResponse;
      } else {
        const errorResponse = createSuccessResponse(
          'Designation In Use',
          null,
          'DESIGNATION_IN_USE',
        );
        return errorResponse;
      }
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        error: error,
        message: 'something went wrong',
      };
    }
  }
}
