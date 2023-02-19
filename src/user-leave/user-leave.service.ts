import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserLeaveDto } from './dto/create-user-leave.dto';
import { UpdateUserLeaveDto } from './dto/update-user-leave.dto';
import {
  UserLeaveSchema,
  UserLeave,
  UserLeaveDocument,
} from '../schemas/user.leave.schema';
import { Model } from 'mongoose';
import { LeaveDocument, Leaves } from 'src/schemas/leave.schema';

import { createSuccessResponse } from 'src/helper/success.helper';
import { RemoveUserLeaveDto } from './dto/remove-user-leave.dto';
import { Users, UserDocument } from 'src/schemas/user.schema';
import {
  NotificationDocument,
  Notification,
} from 'src/schemas/notification.schema';
import { LeaveType, MyLeaveDocument } from 'src/schemas/category.leave.schema';
import { RenewLeaveDto } from './dto/renew-leave.dto';
import { ErrorLog } from 'src/helper/error.helper';

@Injectable()
export class UserLeaveService {
  constructor(
    @InjectModel(UserLeave.name)
    private UserLeaveModel: Model<UserLeaveDocument>,
    @InjectModel(Users.name) private UserModel: Model<UserDocument>,
    @InjectModel(Leaves.name) private LeavesModel: Model<LeaveDocument>,
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    @InjectModel(LeaveType.name) private MyLeaveModel: Model<MyLeaveDocument>,
  ) {}

  async create(createUserLeaveDto: CreateUserLeaveDto) {
    try {
      const userExist = await this.UserModel.findById(
        createUserLeaveDto.user_id,
      );
      if (userExist) {
        createUserLeaveDto.leave_type.forEach(async (element) => {
          const leaveExist = await this.MyLeaveModel.findOne({ _id: element });
          // console.log(leaveExist, 'leaveExist');
          if (leaveExist) {
            createUserLeaveDto.leave_balance = leaveExist.leave_balance;
            // createUserLeaveDto.leave_type = element;
            const leaveAssign = {
              leave_type: element,
              leave_balance: createUserLeaveDto.leave_balance,
              user_id: createUserLeaveDto.user_id,
            };
            // console.log(leaveAssign, 'createUserLeaveDto');
            const data = await this.UserLeaveModel.create(leaveAssign);
            const userData = await this.UserModel.findByIdAndUpdate(
              createUserLeaveDto.user_id,
              { $push: { leave_category: element } },
            );
          }
        });
        const successResponse = await createSuccessResponse(
          'Leave Type Assigned to User',
          {},
          'LEAVE_TYPE_ASSIGNED_TO_USER',
        );
        const leaveData = await this.MyLeaveModel.findOne({
          _id: createUserLeaveDto.leave_type,
        }).populate('leave_type');
        console.log(leaveData.leave_type, 'leaveData');
        const notificationDataManager = {
          message: `New leave rule has been assigned to you`,
          user_id: createUserLeaveDto.user_id,
          link: 'assign leaves',
        };
        const notificationManager = await this.notificationModel.create(
          notificationDataManager,
        );
        return successResponse;
      } else {
        return {
          status: false,
          message: 'User Not Found',
        };
      }
    } catch (error) {
      console.log(error, 'err');
      ErrorLog(error);
      return {
        status: false,
        message: 'Something went wrong',
        error: error,
      };
    }
  }
  async createWithBalance(createUserLeaveDto: any) {
    try {
      const userExist = await this.UserModel.findById(
        createUserLeaveDto.user_id,
      );
      if (userExist) {
        createUserLeaveDto.leave_type.forEach(async (element) => {
          console.log(element, 'element');
          const leaveExist = await this.MyLeaveModel.findOne({
            _id: element.id,
          });

          // console.log(leaveExist, 'leaveExist');
          if (leaveExist) {
            const balance = element.leave_balance;
            // createUserLeaveDto.leave_type = element;
            const leaveAssign = {
              leave_type: element.id,
              leave_balance: balance,
              user_id: createUserLeaveDto.user_id,
            };
            // console.log(leaveAssign, 'createUserLeaveDto');
            const data = await this.UserLeaveModel.create(leaveAssign);
            const userData = await this.UserModel.findByIdAndUpdate(
              createUserLeaveDto.user_id,
              { $push: { leave_category: element.id } },
            );
          }
        });
        // console.log("CHECK>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
        const successResponse = await createSuccessResponse(
          'Leave Type Assigned to User',
          {},
          'LEAVE_TYPE_ASSIGNED_TO_USER',
        );

        const notificationDataManager = {
          message: `New leave rule has been assigned to you`,
          user_id: createUserLeaveDto.user_id,
          link: 'assign leaves',
          action_by: createUserLeaveDto.user_id,
        };
        const notificationManager = await this.notificationModel.create(
          notificationDataManager,
        );
        return successResponse;
      } else {
        return {
          status: false,
          message: 'User Not Found',
        };
      }
    } catch (error) {
      console.log(error, 'err');
      ErrorLog(error);
      return {
        status: false,
        message: 'Something went wrong',
        error: error,
      };
    }
  }
  async removeUserLeave(id: string, removeUserLeaveDto: RemoveUserLeaveDto) {
    try {
      const userExist = await this.UserModel.findOne({
        _id: id,
      });
      if (userExist) {
        removeUserLeaveDto.leave_type.forEach(async (element) => {
          const data = await this.UserLeaveModel.findByIdAndRemove(element);
          const userData = await this.UserModel.findByIdAndUpdate(id, {
            $pull: { leave_category: data.leave_type },
          });
          const leaveData = await this.MyLeaveModel.findOne({
            _id: data.leave_type,
          }).populate('leave_type');
          // console.log(leaveData.leave_type, 'leaveData');
          const notificationDataManager = {
            message: `${leaveData.leave_type} leave rule has been removed from you`,
            user_id: id,
            link: 'remove leaves',
            action_by: id,
          };
          const notificationManager = await this.notificationModel.create(
            notificationDataManager,
          );
          // console.log(notificationManager, 'notificationManager');
        });
        const successResponse = await createSuccessResponse(
          'Leave Type Removed ',
          [],
          'LEAVE_TYPE_REMOVED',
        );
        return successResponse;
      } else {
        return {
          status: false,
          message: 'User Not Found',
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

  async findAll() {
    try {
      const data = await this.UserLeaveModel.find();
      const successResponse = await createSuccessResponse(
        'All User Leave',
        data,
        'ALL_USER_LEAVE',
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

  async findByLeaveType(id: string) {
    try {
      const data = await this.UserLeaveModel.find({ leave_type: id }).populate(
        'leave_type',
      );
      const successResponse = await createSuccessResponse(
        'User Leave',
        data,
        'USER_LEAVE',
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
  async leaveRules() {
    try {
      const data = await this.MyLeaveModel.find().select('leave_type _id');

      const leaveRules = await this.UserLeaveModel.aggregate([
        {
          $match: {
            leave_type: { $exists: true },
          },
        },
        {
          $lookup: {
            from: 'leavetypes',
            localField: 'leave_type',
            foreignField: '_id',
            as: 'lt',
          },
        },
        {
          $unwind: {
            path: '$lt',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: '$leave_type',
            leave_type: { $first: '$lt.leave_type' },
            totalEmpolyee: { $sum: 1 },
          },
        },
      ]);
      const leaveRulesData = [];
      leaveRules.forEach(async (element) => {
        leaveRulesData.push(element.leave_type);
      });

      data.forEach(async (element) => {
        if (!leaveRulesData.includes(element.leave_type)) {
          console.log(true, 'true');
          leaveRules.push({
            _id: element._id,
            leave_type: element.leave_type,
            totalEmpolyee: 0,
          });
        }
      });
      const successResponse = await createSuccessResponse(
        'All User Leave',
        leaveRules,
        'ALL_USER_LEAVE',
      );
      return successResponse;
    } catch (error) {
      return {
        status: false,
        message: 'Something went wrong',
        error: error,
      };
    }
  }
  async findLeavesByUser(id: string) {
    try {
      const data = await this.UserLeaveModel.find({ user_id: id }).populate(
        'leave_type',
      );
      const successResponse = await createSuccessResponse(
        'User Leave',
        data,
        'USER_LEAVE',
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

  async update(id: string, updateUserLeaveDto: UpdateUserLeaveDto) {
    try {
      const leaveCheck = await this.UserLeaveModel.findOne({ _id: id });
      if (leaveCheck) {
        const data = await this.UserLeaveModel.findByIdAndUpdate(
          id,
          updateUserLeaveDto,
          { new: true },
        );
        const successResponse = await createSuccessResponse(
          'User Leave Updated',
          data,
          'USER_LEAVE_UPDATED',
        );
        return successResponse;
      } else {
        return {
          status: false,
          message: 'Leave Type Not Found',
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

  async remove(id: string) {
    try {
      const leaveCheck = await this.UserLeaveModel.findOne({ _id: id });
      if (leaveCheck) {
        const data = await this.UserLeaveModel.findByIdAndDelete(id);
        const successResponse = await createSuccessResponse(
          'User Leave Deleted',
          data,
          'USER_LEAVE_DELETED',
        );
        return successResponse;
      } else {
        return {
          status: false,
          message: 'Leave Type Not Found',
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

  async userLeaveBalance(id: string) {
    console.log(id, 'idd');
    try {
      const userData = await this.UserModel.find({ _id: id }).populate(
        'leave_category',
      );
      console.log(userData, 'userData');
      const userLeaves = await this.UserLeaveModel.find({
        user_id: id,
      }).populate('leave_type');
      const leaveApplies = await this.LeavesModel.find({ applied_by: id });
      console.log(leaveApplies, 'leaveApplies');
      //  let PromiseArray=[userData,userLeaves,leaveApplies];
      //   let data= await Promise.all(PromiseArray);
      let totalLeaveApplied = 0;
      leaveApplies.forEach((leave) => {
        if (
          (leave.status == 'approved' || leave.status == 'pending') &&
          leave.leave_type != 'loss-of-pay'
        ) {
          totalLeaveApplied += leave.leave_amount;
        }
      });
      const data = {
        userLeaves: userLeaves,
        totalLeaveApplied: totalLeaveApplied,
      };
      console.log(data, 'data');

      const successResponse = await createSuccessResponse(
        'User Leave Balance',
        data,
        'USER_LEAVE_BALANCE',
      );
      return successResponse;
    } catch (error) {
      return {
        status: false,
        message: 'Something went wrong',
        error: error,
      };
    }
  }

  async renewLeave(id: string, renewLeaveDto: RenewLeaveDto) {
    try {
      for (let i = 0; i < renewLeaveDto.users.length; i++) {
        const update = await this.UserLeaveModel.findOneAndUpdate(
          {
            user_id: renewLeaveDto.users[i],
            leave_type: renewLeaveDto.leave_type,
          },
          {
            $set: {
              leave_amount: renewLeaveDto.leave_amount,
            },
          },
          { new: true },
        );
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

  async leavesBalance() {
    try {
      const leavesToCarry = await this.MyLeaveModel.find({
        carry_forward: true,
      });
      console.log(leavesToCarry, 'leavesToCarry');
    } catch (error) {
      return {
        status: false,
        message: 'Something went wrong',
        error: error,
      };
    }
  }
}
