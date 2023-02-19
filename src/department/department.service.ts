import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Department, DepartmentDocument } from 'src/schemas/department.schema';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Model } from 'mongoose';
import { Users, UserDocument } from 'src/schemas/user.schema';
import * as fastcsv from 'fast-csv';
import * as fs from 'fs';
// import  {generateBadRequest,generateUnhandledRequest} from '../helper/error.helper';
import { createSuccessResponse } from '../helper/success.helper';
import { ErrorLog } from 'src/helper/error.helper';
import {
  Designation,
  DesignationDocument,
} from 'src/schemas/designation.schema';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectModel(Department.name)
    private DepartmentModel: Model<DepartmentDocument>,
    @InjectModel(Users.name) private UserModel: Model<UserDocument>,
    @InjectModel(Designation.name)
    private DesignationModel: Model<DesignationDocument>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    try {
      // console.log(createDepartmentDto);
      const departmentNameExist = await this.DepartmentModel.findOne({
        department_name: createDepartmentDto.department_name,
      });
      // console.log(departmentNameExist, 'departmentNameExist');
      if (!departmentNameExist) {
        createDepartmentDto.department_name =
          createDepartmentDto.department_name.trim();
        const data = await this.DepartmentModel.create(createDepartmentDto);

        const successResponse = await createSuccessResponse(
          'Department created successfully',
          data,
          'DEPARTMENT_CREATED_SUCCESSFULLY',
        );
        return successResponse;
      } else {
        return {
          status: false,
          message: 'Department name already exist',
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
      const data = await this.DepartmentModel.find({ status: 'active' });
      const successResponse = await createSuccessResponse(
        'Departments fetched successfully',
        data,
        'DEPARTMENTS_FETCHED_SUCCESSFULLY',
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
  async filterDepartment(query: any) {
    try {
      // let queryToPush=[];

      const limit = query.limit ? query.limit : 5;
      const skip = query.skip ? query.skip : 0;
      // console.time('dbsave');
      // let queryToPass = {};
      // if (query.department_name) {
      //   queryToPass = {
      //     department_name: query.department_name,
      //   };
      // }

      const count = await this.DepartmentModel.find(
        query.keyword || query.status
          ? {
              department_name: query.keyword
                ? {
                    $regex: query.keyword,
                    $options: 'i',
                  }
                : { $exists: true },
              status: query.status ? query.status : { $exists: true },
            }
          : {},
      ).count();
      // console.log(count);

      const data = await this.DepartmentModel.find(
        query.keyword || query.status
          ? {
              department_name: query.keyword
                ? {
                    $regex: query.keyword,
                    $options: 'i',
                  }
                : { $exists: true },
              status: query.status ? query.status : { $exists: true },
            }
          : {},
      )
        .sort({ createdAt: query.createdAt ? 1 : -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));
      let finalData = {};
      const pushData = [];
      for (let i = 0; i < data.length; i++) {
        const user = await this.UserModel.find({
          department_id: data[i]._id,
        });
        finalData = {
          department: data[i],
          user: user,
        };
        pushData.push(finalData);
      }
      // data.forEach(async (element) => {
      //   const userData = await this.UserModel.find({
      //     department_id: element._id,
      //   });

      //   // if (userData.length > 0) {
      //   finalData = {
      //     department: element,
      //     users: userData,
      //   };
      //   await pushData.push(finalData);
      //   // console.log(pushData);

      //   // console.log(finalData);
      //   // }
      // });
      // console.timeEnd('dbsave');
      // const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      // await delay(3000);
      const allDepartment = {
        data: pushData,
        totalDepartments: count,
      };
      // console.log(pushData,"pushData");

      return {
        status: true,
        message: 'Department fetched successfully',
        data: allDepartment,
      };

      // console.log(pushData, '>>>>>>>>>>>>>>');
      // const data = await this.DepartmentModel.find();
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
    const data = await this.DepartmentModel.findById(id);
    return data;
  }
  async findAllAndDownload() {
    try {
      const data = await this.DepartmentModel.aggregate([
        {
          $match: {
            _id: { $exists: true },
          },
        },
      ]);
      console.log(data, 'data');
      if (data) {
        const filename = `${Date.now()}_role.csv`;
        const ws = fs.createWriteStream(`./uploads/${filename}`);
        fastcsv
          .write(data, { headers: true })
          .on('finish', function () {
            console.log('Write to fastcsv.csv successfully!');
          })
          .pipe(ws);
        return {
          status: true,
          data: `${filename}`,
        };
      } else {
        const successResponse = await createSuccessResponse(
          'no department found',
          {},
          'NO_DEPARTMENT_FOUND',
        );
        return successResponse;
      }
    } catch (err) {
      console.log(err);
      return {
        status: false,
        message: 'Something went wrong',
        error: err,
      };
    }
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    try {
      const checkId = await this.DepartmentModel.findById(id);
      if (checkId) {
        const data = await this.DepartmentModel.findByIdAndUpdate(
          id,
          updateDepartmentDto,
        );
        const successResponse = await createSuccessResponse(
          'Department updated successfully',
          data,
          'DEPARTMENT_UPDATED_SUCCESSFULLY',
        );
        return successResponse;
      } else {
        return {
          status: false,
          message: 'Department not found',
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

  async activeInactiveDepartment(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
  ) {
    try {
      const checkId = await this.DepartmentModel.findById(id);
      if (checkId) {
        let status = '';
        if (updateDepartmentDto.status == 'active') {
          status = 'active';
        } else {
          status = 'inactive';
        }
        const data = await this.DepartmentModel.findByIdAndUpdate(
          id,
          { $set: { status: status } },
          { new: true },
        );
        const successResponse = await createSuccessResponse(
          'Department updated successfully',
          data,
          'DEPARTMENT_UPDATED_SUCCESSFULLY',
        );
        return successResponse;
      } else {
        return {
          status: false,
          message: 'Department not found',
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

  async remove(id: string) {
    try {
      const user = await this.UserModel.find({ department_id: id });
      // console.log(user);
      if (user.length > 0 && user) {
        const successResponse = await createSuccessResponse(
          'Department has users',
          {},
          'DEPARTMENT_HAS_USERS',
        );
        return successResponse;
        // return {message:"department has users"}
      } else {
        const data = this.DepartmentModel.findByIdAndDelete(id);
        const designation = this.DesignationModel.deleteMany({
          department: id,
        });
        await Promise.all([data, designation]);
        const successResponse = await createSuccessResponse(
          'Department deleted successfully',
          {},
          'DEPARTMENT_DELETED_SUCCESSFULLY',
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
