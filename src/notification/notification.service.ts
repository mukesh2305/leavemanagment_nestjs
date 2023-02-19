import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Notification,
  NotificationDocument,
} from 'src/schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Model } from 'mongoose';
import { createSuccessResponse } from 'src/helper/success.helper';
import { ReadNotificationDto } from './dto/read-notification.dto';
import { ErrorLog } from 'src/helper/error.helper';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    try {
      const data = await this.notificationModel.create(createNotificationDto);
      const successResponse = await createSuccessResponse(
        'Notification Created',
        data,
        'NOTIFICATION_CREATED',
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

  async findAll() {
    try {
      const data = await this.notificationModel.find();
      const successResponse = await createSuccessResponse(
        'All Notification',
        data,
        'ALL_NOTIFICATION',
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

  async findOne(id: string) {
    try {
      const data = await this.notificationModel.findById(id);
      // let data = await this.notificationModel.aggregate([
      //   {
      //     $match: {
      //       _id: id
      //     }
      //   },
      //   {
      //     $lookup: {
      //       from: "users",
      //       localField: "user_id",
      //       foreignField: "_id",
      //       as: "user_data"
      //     }
      //   },
      //   {
      //     $unwind: "$user_data"
      //   },
      //   {
      //     $lookup: {
      //       from: "users",
      //       localField: "action_by",
      //       foreignField: "_id",
      //       as: "action_by_data"
      //     }
      //   },
      //   {
      //     $unwind: "$action_by_data"
      //   },
      //   {
      //     $project: {
      //       _id: 1,
      //       action_by_data: {
      //         _id: 1,
      //         first_name: 1,
      //         last_name: 1,
      //         email: 1,
      //       },

      //       user_data:{
      //         _id:1,
      //         first_name:1,
      //         last_name:1,
      //         email:1,
      //       },
      //       status: 1,
      //       message: 1,
      //       created_at: 1,
      //       updated_at: 1
      //     }
      //   }
      // ]);

      const successResponse = await createSuccessResponse(
        'Notification',
        data,
        'NOTIFICATION',
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
  async findByUserId(id: string) {
    try {
      // let notificationIds=await this.notificationModel.find({user_id:id}).select('_id');
      // notificationIds.forEach(async (element) => {
      // let editShowData=await this.notificationModel.findByIdAndUpdate(element,{$push:{show:element}},{new:true});
      // });

      const data = await this.notificationModel
        .find({ user_id: id, status: 'unread' })
        .populate('user_id')
        .populate('action_by')
        .sort({ createdAt: -1 });
      const successResponse = await createSuccessResponse(
        'Notification',
        data,
        'NOTIFICATION',
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
  async readByUserId(id: string, readNotificationDto: ReadNotificationDto) {
    try {
      const verifyUser = await this.notificationModel.findOne({ user_id: id });
      if (verifyUser) {
        const notificationIds = readNotificationDto.notifications;
        notificationIds.forEach(async (element) => {
          await this.notificationModel.findByIdAndDelete(element);
        });
        const data = await this.notificationModel
          .find({ user_id: id, status: 'unread' })
          .populate('user_id')
          .populate('action_by');
        const successResponse = await createSuccessResponse(
          'Notification',
          data,
          'NOTIFICATION',
        );
        return successResponse;
      } else {
        return {
          status: false,
          message: 'User not found',
        };
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

  async update(id: string, updateNotificationDto: UpdateNotificationDto) {
    try {
      const data = await this.notificationModel.findByIdAndUpdate(
        id,
        updateNotificationDto,
        { new: true },
      );
      const successResponse = await createSuccessResponse(
        'Notification Updated',
        data,
        'NOTIFICATION_UPDATED',
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
      const data = await this.notificationModel.findByIdAndDelete(id);
      const successResponse = await createSuccessResponse(
        'Notification Deleted',
        data,
        'NOTIFICATION_DELETED',
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
