import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleSchema, Roles, RoleDocument } from 'src/schemas/role.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AssignRemovePermissionDto } from './dto/assign-remove-permission.dto';
import { createSuccessResponse } from 'src/helper/success.helper';
import { Users, UserDocument } from 'src/schemas/user.schema';
import * as fastcsv from 'fast-csv';
import * as fs from 'fs';
import { ErrorLog } from 'src/helper/error.helper';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Roles.name) private RoleModel: Model<RoleDocument>,
    @InjectModel(Users.name) private UserModel: Model<UserDocument>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const data = await this.RoleModel.create(createRoleDto);
    const successResponse = await createSuccessResponse(
      'role created successfully',
      data,
      'ROLE_CREATED',
    );
    return successResponse;
  }

  async findAll(query: any) {
    try {
      const limit = parseInt(query.limit);
      const skip = parseInt(query.skip);
      const count = await this.RoleModel.find().count();
      const data = await this.RoleModel.find().limit(limit).skip(skip);
      const roleData = {
        totalRole: count,
        data: data,
      };
      if (data) {
        const successResponse = await createSuccessResponse(
          'roles fetched successfully',
          roleData,
          'ROLE_FETCHED',
        );
        return successResponse;
      } else {
        const successResponse = await createSuccessResponse(
          'no roles found',
          {},
          'NO_ROLES_FOUND',
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
  async findAllAndDownload() {
    try {
      const data = await this.RoleModel.aggregate([
        {
          $match: {
            _id: { $exists: true },
          },
        },
      ]);
      console.log(data, 'data');
      if (data) {
        const successResponse = await createSuccessResponse(
          'roles fetched successfully',
          data,
          'ROLE_FETCHED',
        );
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
          'no roles found',
          {},
          'NO_ROLES_FOUND',
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

  async findOne(id: string) {
    try {
      const data = await this.RoleModel.findById(id).populate('permission');
      if (data) {
        const successResponse = await createSuccessResponse(
          'role fetched successfully',
          data,
          'ROLE_FETCHED',
        );
        return successResponse;
      } else {
        const successResponse = await createSuccessResponse(
          'no role found',
          {},
          'NO_ROLE_FOUND',
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

  async findById(id: string) {
    const data = await this.RoleModel.findById(id).populate('permission');

    return data;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    try {
      const status = updateRoleDto.role_status;
      const data = await this.RoleModel.findByIdAndUpdate(
        id,
        { $set: { role_status: status } },
        { new: true },
      );
      const successResponse = await createSuccessResponse(
        'role updated successfully',
        data,
        'ROLE_UPDATED',
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
  async addPermissionToRole(
    id: string,
    assignRemovePermissionDto: AssignRemovePermissionDto,
  ) {
    try {
      assignRemovePermissionDto.permission.forEach(async (item) => {
        await this.RoleModel.findByIdAndUpdate(id, {
          $push: { permission: item },
        });
      });
      const data = await this.RoleModel.findById(id).populate('permission');
      const successResponse = await createSuccessResponse(
        'permission added successfully',
        data,
        'PERMISSION_ADDED',
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
  async removePermissionToRole(
    id: string,
    assignRemovePermissionDto: AssignRemovePermissionDto,
  ) {
    try {
      assignRemovePermissionDto.permission.forEach(async (item) => {
        await this.RoleModel.findByIdAndUpdate(id, {
          $pull: { permission: item },
        });
      });
      const data = await this.RoleModel.findById(id).populate('permission');
      const successResponse = await createSuccessResponse(
        'permission removed successfully',
        data,
        'PERMISSION_REMOVED',
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
      const role = await this.RoleModel.find({ _id: id });
      const roleAssignToUser = await this.UserModel.find({ user_role: id });
      if (role) {
        if (roleAssignToUser.length > 0) {
          const successResponse = await createSuccessResponse(
            'role not deleted,role is assigned to user',
            {},
            'ROLE_ASSIGNED_TO_USER',
          );
          return successResponse;
        } else {
          const data = await this.RoleModel.findByIdAndDelete(id);
          const successResponse = await createSuccessResponse(
            'role deleted successfully',
            data,
            'ROLE_DELETED',
          );
          return successResponse;
        }
      } else {
        const successResponse = await createSuccessResponse(
          'no role found',
          {},
          'NO_ROLE_FOUND',
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
}
