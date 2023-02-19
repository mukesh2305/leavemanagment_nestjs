import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PermissionDocument } from 'src/schemas/permission.schema';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Model } from 'mongoose';
import { createSuccessResponse } from 'src/helper/success.helper';

@Injectable()
export class PermissionService {
  constructor(
    @InjectModel('Permission')
    private readonly permissionModel: Model<PermissionDocument>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto) {
    const data = await this.permissionModel.create(createPermissionDto);
    const successResponse = await createSuccessResponse(
      'permission created successfully',
      data,
      'PERMISSION_CREATED',
    );
    return successResponse;
  }

  async findAll() {
    const data = await this.permissionModel.find();
    const successResponse = await createSuccessResponse(
      'permissions fetched successfully',
      data,
      'PERMISSION_FETCHED',
    );
    return successResponse;
  }

  async findOne(id: string) {
    const data = await this.permissionModel.findById(id);
    const successResponse = await createSuccessResponse(
      'permission fetched successfully',
      data,
      'PERMISSION_FETCHED',
    );
    return successResponse;
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto) {
    const data = await this.permissionModel.findByIdAndUpdate(
      id,
      updatePermissionDto,
    );
    const successResponse = await createSuccessResponse(
      'permission updated successfully',
      data,
      'PERMISSION_UPDATED',
    );
    return successResponse;
  }

  async remove(id: string) {
    const data = await this.permissionModel.findByIdAndDelete(id);
    const successResponse = await createSuccessResponse(
      'permission removed successfully',
      data,
      'PERMISSION_REMOVED',
    );
    return successResponse;
  }
}
