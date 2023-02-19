import { Injectable } from '@nestjs/common';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument, Users } from 'src/schemas/user.schema';
import { HolidayDocument, Holidays } from 'src/schemas/holiday.schema';
import { Leaves, LeaveDocument } from 'src/schemas/leave.schema';
import { Model, Schema as MongooseSchema } from 'mongoose';
import * as moment from 'moment';
import * as nodemailer from 'nodemailer';
import { createSuccessResponse } from 'src/helper/success.helper';
// import { Notification, NotificationDocument } from 'src/schemas/notification.schema';
import * as mongoose from 'mongoose';
import {
  UserLeaveSchema,
  UserLeave,
  UserLeaveDocument,
} from '../schemas/user.leave.schema';
import { ApproveLeaveDto } from './dto/approve-leave.dto';
import { RejectLeaveDto } from './dto/reject-leave.dto';
import {
  NotificationDocument,
  Notification,
} from 'src/schemas/notification.schema';
import { NotificationService } from 'src/notification/notification.service';
import * as fastcsv from 'fast-csv';
import * as fs from 'fs';
import { LeaveType, MyLeaveDocument } from 'src/schemas/category.leave.schema';
const NULL_SHING_VALUE = ['', null, 'undefined', ' '];
import { ErrorLog } from 'src/helper/error.helper';
import { sendMail } from 'src/helper/mail.helper';

function getBusinessDatesCount(arr) {
  let count = 0;

  arr.forEach((item) => {
    item = new Date(item);
    const dayOfWeek = item.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
  });
  return count;
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587,
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    // pass: 'tqyljiprhvjbopea'
    pass: process.env.EMAIL_PASSWORD,
  },
});

@Injectable()
export class LeaveService {
  constructor(
    @InjectModel(Leaves.name) private LeavesModel: Model<LeaveDocument>,
    @InjectModel(Users.name) private UserModel: Model<UserDocument>,
    @InjectModel(LeaveType.name) private MyLeaveModel: Model<MyLeaveDocument>,
    @InjectModel(Holidays.name) private HolidaysModel: Model<HolidayDocument>,
    private readonly notificationService: NotificationService,
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    @InjectModel(UserLeave.name)
    private UserLeaveModel: Model<UserLeaveDocument>,
  ) {}

  async create(createLeaveDto: CreateLeaveDto) {
    try {
      let diffDays = 0;
      let holidayFlag = false;
      const validateEndDate = new Date(createLeaveDto.endDate);
      const validateStartDate = new Date(createLeaveDto.startDate);
      if (
        createLeaveDto.startDateLeaveType === '' ||
        createLeaveDto.endDateLeaveType === '' ||
        NULL_SHING_VALUE.includes(createLeaveDto.startDateLeaveType) ||
        NULL_SHING_VALUE.includes(createLeaveDto.endDateLeaveType)
      ) {
        return {
          status: 400,
          message: 'Please select leave type',
        };
      }
      if (validateEndDate < validateStartDate) {
        return {
          statusCode: 400,
          message: 'End date should be greater than start date',
        };
      }
      let leaveErrorCount = 0;
      let leaveData;
      const HolidayData = await this.HolidaysModel.find();
      const holidayArray = [];
      HolidayData.forEach((holiday) => {
        holidayArray.push(holiday.holiday_date);
      });

      const start = createLeaveDto.startDate;
      const end = createLeaveDto.endDate;

      const dateArray = [];
      let currentDate = moment(start);
      const stopDate = moment(end);
      while (currentDate <= stopDate) {
        dateArray.push(moment(currentDate).format('YYYY-MM-DD'));
        currentDate = moment(currentDate).add(1, 'days');
      }

      const holidayFinalArray = [];
      holidayArray.forEach((holiday) => {
        holiday = JSON.stringify(holiday);
        const holidayDate = holiday.split('T')[0];
        holidayFinalArray.push(holidayDate.slice(1, holidayDate.length));
      });

      const final = dateArray.filter(function (item) {
        return !holidayFinalArray.includes(item);
      });
      dateArray.forEach(function (item) {
        if (holidayFinalArray.includes(item)) {
          holidayFlag = true;
        }
      });

      if (
        createLeaveDto.startDateLeaveType == 'first-half' ||
        createLeaveDto.startDateLeaveType == 'second-half'
      ) {
        leaveErrorCount = leaveErrorCount + 0.5;
      }
      if (
        createLeaveDto.endDateLeaveType == 'first-half' ||
        createLeaveDto.endDateLeaveType == 'second-half'
      ) {
        leaveErrorCount = leaveErrorCount + 0.5;
      }
      const numOfDates = getBusinessDatesCount(final);

      diffDays = numOfDates - leaveErrorCount;

      const userLeaveData = await this.UserLeaveModel.find({
        user_id: createLeaveDto.applied_by,
      }).populate('leave_type');

      let leaveTypeResFlag = 0;
      let leavebalanceResFlag = 0;
      if (diffDays > 0) {
        if (userLeaveData.length > 0) {
          userLeaveData.forEach(async (userLeave) => {
            if (userLeave.leave_type.leave_type == createLeaveDto.leave_type) {
              leaveTypeResFlag = 1;

              if (userLeave.leave_balance >= diffDays) {
                if (createLeaveDto.leave_type == 'loss-of-pay') {
                  leavebalanceResFlag = 1;
                  leaveTypeResFlag = 2;
                  createLeaveDto.leave_amount = diffDays;
                  createLeaveDto.user_leave_id = userLeave._id;

                  leaveData = await this.LeavesModel.create(createLeaveDto);
                  const updateUserLeave =
                    await this.UserLeaveModel.findOneAndUpdate(
                      { _id: userLeave._id },
                      { $inc: { leave_balance: -diffDays } },
                    );
                  const userDataToUpdate = await this.UserModel.findOne({
                    _id: createLeaveDto.applied_by,
                  });
                  let paneltyToAdd = 0;
                  paneltyToAdd = userDataToUpdate.panelty + diffDays;
                  const updateUser = await this.UserModel.findOneAndUpdate(
                    { _id: createLeaveDto.applied_by },
                    { $set: { panelty: paneltyToAdd } },
                  );
                } else {
                  leavebalanceResFlag = 1;
                  createLeaveDto.leave_amount = diffDays;
                  createLeaveDto.user_leave_id = userLeave._id;

                  leaveData = await this.LeavesModel.create(createLeaveDto);
                  const updateUserLeave =
                    await this.UserLeaveModel.findOneAndUpdate(
                      { _id: userLeave._id },
                      { $inc: { leave_balance: -diffDays } },
                    );
                }
              }
            }
          });
        } else {
          const errorResponse = await createSuccessResponse(
            'Leave type is not available',
            null,
            'LEAVE_TYPE_NOT_AVAILABLE',
          );
          return errorResponse;
        }
      } else {
        const errorResponse = await createSuccessResponse(
          'Leave cannot be applied for this date it is holiday or weekend',
          null,
          'LEAVE_CANT_APPLIED_FOR_THIS_DATE',
        );
        return errorResponse;
      }

      if (leaveTypeResFlag == 0) {
        const errorResponse = await createSuccessResponse(
          'Leave type is not available',
          null,
          'LEAVE_TYPE_NOT_AVAILABLE',
        );
        return errorResponse;
      }
      if (leaveTypeResFlag == 2) {
        const data = {
          leaveData,
          holidayFlag,
        };
        const successResponse = await createSuccessResponse(
          'Loss-Of-Pay Leave applied successfullly',
          data,
          'LEAVE_APPLIED',
        );
        const userData = await this.UserModel.findOne({
          _id: createLeaveDto.applied_by,
        }).populate('user_role');

        const reportingManagerData = await this.UserModel.findOne({
          _id: userData.reporting_manager,
        });
        const body = `<p>You have applied for a ${
          createLeaveDto.leave_type
        } leave.</p>
        <p><b>Leave Type:</b> ${createLeaveDto.leave_type} leave</p>
        <p><b>Leave Dates:</b> ${moment(createLeaveDto.startDate).format(
          'DD-MM-YYYY',
        )} - ${moment(createLeaveDto.endDate).format('DD-MM-YYYY')}</p>
        <p><b>No of Days:</b> ${diffDays} Days</p>
        <p><b>Reason for Leave</b> ${createLeaveDto.reason}</p>`;
        sendMail(
          userData.email,
          'Leave Applied',
          `${userData.first_name} ${userData.last_name}`,
          body,
        );
        if (reportingManagerData) {
          const to = reportingManagerData.email;
          const subject = 'Leave Applied';
          const user = `${reportingManagerData.first_name} ${reportingManagerData.last_name}`;
          const body = ` <p>${userData.first_name} ${
            userData.last_name
          } have applied for a ${createLeaveDto.leave_type} leave.</p>
                <p><b>Leave Type:</b> ${createLeaveDto.leave_type} leave</p>
                <p><b>Leave Dates:</b>${moment(createLeaveDto.startDate).format(
                  'DD-MM-YYYY',
                )} - ${moment(createLeaveDto.endDate).format('DD-MM-YYYY')}</p>
                <p><b>No of Days:</b> ${diffDays} Days</p>
                <p><b>Reason for Leave</b> ${createLeaveDto.reason}</p>`;
          sendMail(to, subject, user, body);
        }
        const notificationData = {
          message: `You, have applied for a ${createLeaveDto.leave_type} leave.`,
          user_id: createLeaveDto.applied_by,
          link: userData.avtar,
          action_by: createLeaveDto.applied_by,
        };
        const notification = await this.notificationModel.create(
          notificationData,
        );

        const notificationDataManager = {
          message: `${userData.first_name} ${userData.last_name},has applied for a ${createLeaveDto.leave_type} leave.`,
          user_id: userData.reporting_manager,
          link: userData.avtar,
          action_by: createLeaveDto.applied_by,
        };

        const notificationManager = await this.notificationModel.create(
          notificationDataManager,
        );

        const allUser = await this.UserModel.find().populate('user_role');

        const admin = await allUser.filter((user) => {
          if (user.user_role) {
            if (
              user.user_role.role_name == 'superAdmin' &&
              !user._id.equals(userData.reporting_manager) &&
              !user._id.equals(createLeaveDto.applied_by)
            ) {
              return user;
            }
          }
        });

        admin.forEach(async (admin) => {
          const notificationDataAdmin = {
            message: `${userData.first_name} ${userData.last_name},has applied for a ${createLeaveDto.leave_type} leave.`,
            user_id: admin._id,
            link: userData.avtar,
            action_by: createLeaveDto.applied_by,
          };
          const notificationAdmin = await this.notificationModel.create(
            notificationDataAdmin,
          );
          const to = admin.email;
          const subject = 'Leave Applied';
          const user = `${admin.first_name} ${admin.last_name}`;
          const body = ` <p>${userData.first_name} ${
            userData.last_name
          } have applied for a ${createLeaveDto.leave_type} leave.</p>
                  <p><b>Leave Type:</b> ${createLeaveDto.leave_type} leave</p>
                  <p><b>Leave Dates:</b> ${moment(
                    createLeaveDto.startDate,
                  ).format('DD-MM-YYYY')} - ${moment(
            createLeaveDto.endDate,
          ).format('DD-MM-YYYY')}</p>
                  <p><b>No of Days:</b> ${diffDays} Days</p>
                  <p><b>Reason for Leave</b> ${createLeaveDto.reason}</p>`;

          sendMail(to, subject, user, body);
        });

        return successResponse;
      }
      if (leaveTypeResFlag == 1) {
        const data = {
          leaveData: createLeaveDto,
          holidayFlag,
        };
        if (leavebalanceResFlag == 0) {
          const errorResponse = await createSuccessResponse(
            'Leave balance is not enough',
            null,
            'LEAVE_BALANCE_NOT_ENOUGH',
          );
          return errorResponse;
        } else {
          const successResponse = await createSuccessResponse(
            'Leave applied successfullly',
            data,
            'LEAVE_APPLIED',
          );

          const userData = await this.UserModel.findOne({
            _id: createLeaveDto.applied_by,
          }).populate('user_role');

          const reportingManagerData = await this.UserModel.findOne({
            _id: userData.reporting_manager,
          });

          const to = userData.email;
          const subject = 'Leave Applied';
          const user = `${userData.first_name} ${userData.last_name}`;
          const body = ` <p>You have applied for a ${
            createLeaveDto.leave_type
          } leave.</p>
          <p><b>Leave Type:</b> ${createLeaveDto.leave_type} leave</p>
          <p><b>Leave Dates:</b> ${moment(createLeaveDto.startDate).format(
            'DD-MM-YYYY',
          )} - ${moment(createLeaveDto.endDate).format('DD-MM-YYYY')}</p>
          <p><b>No of Days:</b> ${diffDays} Days</p>
          <p><b>Reason for Leave</b> ${createLeaveDto.reason}</p>
          `;
          sendMail(to, subject, user, body);
          if (reportingManagerData) {
            const to = reportingManagerData.email;
            const subject = 'Leave Applied';
            const user = `${reportingManagerData.first_name} ${reportingManagerData.last_name}`;
            const body = ` <p>${userData.first_name} ${
              userData.last_name
            } have applied for a ${createLeaveDto.leave_type} leave.</p>
                  <p><b>Leave Type:</b> ${createLeaveDto.leave_type} leave</p>
                  <p><b>Leave Dates:</b>${moment(
                    createLeaveDto.startDate,
                  ).format('DD-MM-YYYY')} - ${moment(
              createLeaveDto.endDate,
            ).format('DD-MM-YYYY')}</p>
                  <p><b>No of Days:</b> ${diffDays} Days</p>
                  <p><b>Reason for Leave</b> ${createLeaveDto.reason}</p>`;
            sendMail(to, subject, user, body);
          }
          const notificationData = {
            message: `You, have applied for a ${createLeaveDto.leave_type} leave.`,
            user_id: createLeaveDto.applied_by,
            link: userData.avtar,
            action_by: createLeaveDto.applied_by,
          };
          const notification = await this.notificationModel.create(
            notificationData,
          );
          const notificationDataManager = {
            message: `${userData.first_name} ${userData.last_name},has applied for a ${createLeaveDto.leave_type} leave.`,
            user_id: userData.reporting_manager,
            link: userData.avtar,
            action_by: createLeaveDto.applied_by,
          };

          const notificationManager = await this.notificationModel.create(
            notificationDataManager,
          );
          const allUser = await this.UserModel.find().populate('user_role');

          const admin = await allUser.filter((user) => {
            if (user.user_role) {
              if (
                user.user_role.role_name == 'superAdmin' &&
                !user._id.equals(userData.reporting_manager) &&
                !user._id.equals(createLeaveDto.applied_by)
              ) {
                return user;
              }
            }
          });
          admin.forEach(async (admin) => {
            const notificationDataAdmin = {
              message: `${userData.first_name} ${userData.last_name},has applied for a ${createLeaveDto.leave_type} leave.`,
              user_id: admin._id,
              link: userData.avtar,
              action_by: createLeaveDto.applied_by,
            };
            const notificationAdmin = await this.notificationModel.create(
              notificationDataAdmin,
            );
            const to = admin.email;
            const subject = 'Leave Applied';
            const user = `${admin.first_name} ${admin.last_name}`;
            const body = ` <p>${userData.first_name} ${
              userData.last_name
            } have applied for a ${createLeaveDto.leave_type} leave.</p>
                    <p><b>Leave Type:</b> ${createLeaveDto.leave_type} leave</p>
                    <p><b>Leave Dates:</b> ${moment(
                      createLeaveDto.startDate,
                    ).format('DD-MM-YYYY')} - ${moment(
              createLeaveDto.endDate,
            ).format('DD-MM-YYYY')}</p>
                    <p><b>No of Days:</b> ${diffDays} Days</p>
                    <p><b>Reason for Leave</b> ${createLeaveDto.reason}</p>`;
            sendMail(to, subject, user, body);
          });

          return successResponse;
        }
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
      const data = await this.LeavesModel.find()
        .populate('applied_by')
        .populate('leave_type')
        .populate('approved_by');
      const successResponse = await createSuccessResponse(
        'Leave List',
        data,
        'LEAVE_LIST',
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

  async downloadLeaveList2() {
    try {
      const data = await this.LeavesModel.aggregate([
        {
          $match: {
            _id: { $exists: true },
          },
        },
      ]);
      const filename = `${Date.now()}_leave.csv`;
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
  async downloadLeaveList() {
    try {
      const queryToPass = [];

      queryToPass.push(
        {
          $match: {
            applied_by: { $exists: true },
          },
        },
        // {$sort: {createdAt: -1}},
        {
          $lookup: {
            from: 'users',
            localField: 'applied_by',
            foreignField: '_id',
            as: 'applied_by',
          },
        },
        {
          $unwind: {
            path: '$applied_by',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'approved_by',
            foreignField: '_id',
            as: 'approved_by',
          },
        },
        {
          $unwind: {
            path: '$approved_by',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'departments',
            localField: 'applied_by.department',
            foreignField: '_id',
            as: 'applied_by.department',
          },
        },
        {
          $unwind: {
            path: '$applied_by.department',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'action_by',
            foreignField: '_id',
            as: 'action_by',
          },
        },
        {
          $unwind: {
            path: '$action_by',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $project: {
            // _id: 1,
            leave_type: 1,
            leave_amount: 1,
            first_name: '$applied_by.first_name',
            last_name: '$applied_by.last_name',
            email: '$applied_by.email',
            startDateLeaveType: 1,
            endDateLeaveType: 1,
            reason: 1,
            startDate: {
              $dateToString: { format: '%d-%m-%Y', date: '$startDate' },
            },
            endDate: {
              $dateToString: { format: '%d-%m-%Y', date: '$endDate' },
            },
            status: 1,
            action_by_status: 1,

            action_by: {
              $concat: ['$action_by.first_name', ' ', '$action_by.last_name'],
            },

            approved_by: {
              $concat: [
                '$approved_by.first_name',
                ' ',
                '$approved_by.last_name',
              ],
            },
            rejection_reason: 1,
            createdAt: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            updatedAt: {
              $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' },
            },
          },
        },

        { $sort: { createdAt: -1 } },
      );
      const data = await this.LeavesModel.aggregate(queryToPass);
      console.log(data, 'data');
      const filename = `${Date.now()}_leave.csv`;
      const ws = await fs.createWriteStream(`./uploads/${filename}`);
      fastcsv
        .write(data, {
          headers: [
            'first_name',
            'last_name',
            'email',
            'leave_type',
            'leave_amount',
            'startDateLeaveType',
            'endDateLeaveType',
            'reason',
            'startDate',
            'endDate',
            'status',
            'action_by_status',
            'action_by',
            'approved_by',
            'rejection_reason',
            'createdAt',
            'updatedAt',
          ],
        })
        .on('finish', function () {
          console.log('Write to fastcsv.csv successfully!');
        })
        .pipe(ws);
      return {
        status: true,
        data: `${filename}`,
      };
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

  async getAllLeaves() {
    try {
      const futureLeave = [],
        allLeaveData = [],
        todayLeave = [];
      const data = await this.LeavesModel.find({ status: 'approved' })
        .populate('applied_by')
        .sort({ startDate: 1 });

      //today date logic
      const today = new Date();
      const dd = today.getDate();
      const mm = today.getMonth() + 1;
      const yyyy = today.getFullYear();
      const currentDate = `${yyyy}/${mm}/${dd}`;
      const realDate = currentDate.split('/');
      data.forEach((leave) => {
        // leave.status == 'approved'
        if (leave.startDate && leave.endDate) {
          //start date logic
          const dd1 = leave.startDate.getDate();
          const mm1 = leave.startDate.getMonth() + 1;
          const yyyy1 = leave.startDate.getFullYear();
          const startDate1 = `${yyyy1}/${mm1}/${dd1}`;
          const startDate = startDate1.split('/');
          //enddate logic
          const dd2 = leave.endDate.getDate();
          const mm2 = leave.endDate.getMonth() + 1;
          const yyyy2 = leave.endDate.getFullYear();
          const endDate1 = `${yyyy2}/${mm2}/${dd2}`;
          const endDate = endDate1.split('/');

          const dateToday = moment(realDate);
          const dateStartDate = moment(startDate);
          const dateEndDate = moment(endDate);
          const resultStartDate = dateStartDate.diff(dateToday, 'days');
          const resultEndDate = dateEndDate.diff(dateToday, 'days');

          if (resultStartDate > 0 || resultEndDate > 0) {
            futureLeave.push(leave);
          }
          if (resultStartDate == 0 || resultEndDate == 0) {
            todayLeave.push(leave);
          }
        }
      });
      const applied_by = futureLeave.map((item) => item.applied_by);
      const unique = applied_by.filter((v, i) => applied_by.indexOf(v) === i);
      // console.log(unique, 'unique');
      const newObjForFutureLeave = [];
      for (let i = 0; i < unique.length; i++) {
        const temp = [];
        for (let j = 0; j < futureLeave.length; j++) {
          if (unique[i]._id == futureLeave[j].applied_by._id) {
            temp.push(futureLeave[j]);
          }
        }
        const obj1 = {
          user: unique[i],
          leaves: temp,
        };
        newObjForFutureLeave.push(obj1);
      }

      const todayLeaveAppliedBy = todayLeave.map((item) => item.applied_by);
      const uniqueTodayLeave = todayLeaveAppliedBy.filter(
        (v, i) => todayLeaveAppliedBy.indexOf(v) === i,
      );

      const newObjForTodayLeave = [];
      for (let i = 0; i < uniqueTodayLeave.length; i++) {
        const temp = [];
        for (let j = 0; j < todayLeave.length; j++) {
          if (uniqueTodayLeave[i]._id == todayLeave[j].applied_by._id) {
            temp.push(todayLeave[j]);
          }
        }

        const obj1 = {
          user: unique[i],
          leaves: temp,
        };
        newObjForTodayLeave.push(obj1);
      }

      allLeaveData.push(newObjForFutureLeave);
      allLeaveData.push(newObjForTodayLeave);
      return allLeaveData;
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

  async getFutureAndTodayLeave(id: string) {
    try {
      const futureLeave = [],
        todayLeave = [],
        allLeaveData = [];

      const userData = await this.UserModel.find({
        reporting_manager: id,
      }).select('_id');
      const userId = [];
      userData.map((item) => {
        userId.push(item._id);
      });
      const data = await this.LeavesModel.find({
        applied_by: { $in: userId },
        status: 'approved',
      })
        .populate('applied_by')
        .sort({ startDate: 1 });

      //today date logic
      const today = new Date();
      const dd = today.getDate();
      const mm = today.getMonth() + 1;
      const yyyy = today.getFullYear();
      const currentDate = `${yyyy}/${mm}/${dd}`;
      const realDate = currentDate.split('/');
      data.forEach((leave) => {
        // leave.status == 'approved'
        if (leave.startDate && leave.endDate) {
          //start date logic
          const dd1 = leave.startDate.getDate();
          const mm1 = leave.startDate.getMonth() + 1;
          const yyyy1 = leave.startDate.getFullYear();
          const startDate1 = `${yyyy1}/${mm1}/${dd1}`;
          const startDate = startDate1.split('/');
          //enddate logic
          const dd2 = leave.endDate.getDate();
          const mm2 = leave.endDate.getMonth() + 1;
          const yyyy2 = leave.endDate.getFullYear();
          const endDate1 = `${yyyy2}/${mm2}/${dd2}`;
          const endDate = endDate1.split('/');

          const dateToday = moment(realDate);
          const dateStartDate = moment(startDate);
          const dateEndDate = moment(endDate);
          const resultStartDate = dateStartDate.diff(dateToday, 'days');
          const resultEndDate = dateEndDate.diff(dateToday, 'days');

          if (resultStartDate > 0 || resultEndDate > 0) {
            futureLeave.push(leave);
          }
          if (resultStartDate == 0 || resultEndDate == 0) {
            todayLeave.push(leave);
          }
        }
      });
      const applied_by = futureLeave.map((item) => item.applied_by);
      const unique = applied_by.filter((v, i) => applied_by.indexOf(v) === i);
      // console.log(unique, 'unique');
      const newObjForFutureLeave = [];
      for (let i = 0; i < unique.length; i++) {
        const temp = [];
        for (let j = 0; j < futureLeave.length; j++) {
          if (unique[i]._id == futureLeave[j].applied_by._id) {
            temp.push(futureLeave[j]);
          }
        }
        const obj1 = {
          user: unique[i],
          leaves: temp,
        };
        newObjForFutureLeave.push(obj1);
      }

      const todayLeaveAppliedBy = todayLeave.map((item) => item.applied_by);
      const uniqueTodayLeave = todayLeaveAppliedBy.filter(
        (v, i) => todayLeaveAppliedBy.indexOf(v) === i,
      );

      const newObjForTodayLeave = [];
      for (let i = 0; i < uniqueTodayLeave.length; i++) {
        const temp = [];
        for (let j = 0; j < todayLeave.length; j++) {
          if (uniqueTodayLeave[i]._id == todayLeave[j].applied_by._id) {
            temp.push(todayLeave[j]);
          }
        }

        const obj1 = {
          user: unique[i],
          leaves: temp,
        };
        newObjForTodayLeave.push(obj1);
      }

      allLeaveData.push(newObjForFutureLeave);
      allLeaveData.push(newObjForTodayLeave);
      return allLeaveData;
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

  async downloadLeaveDataForRM(id: string) {
    try {
      const userData = await this.UserModel.find({
        reporting_manager: id,
      }).select('_id');
      const userId = [];
      userData.map((item) => {
        userId.push(item._id);
      });
      const data = await this.LeavesModel.aggregate([
        { $match: { applied_by: { $in: userId } } },
        {
          $lookup: {
            from: 'users',
            localField: 'applied_by',
            foreignField: '_id',
            as: 'applied_by',
          },
        },
        {
          $unwind: {
            path: '$applied_by',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'approved_by',
            foreignField: '_id',
            as: 'approved_by',
          },
        },
        {
          $unwind: {
            path: '$approved_by',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            leave_type: 1,
            leave_amount: 1,
            applied_by: {
              _id: 1,
              emp_id: '$applied_by.emp_id',
              first_name: '$applied_by.first_name',
              last_name: '$applied_by.last_name',
              email: '$applied_by.email',
              avtar: '$applied_by.avtar',
              reporting_manager: '$applied_by.reporting_manager',
            },
            startDateLeaveType: 1,
            endDateLeaveType: 1,
            reason: 1,
            startDate: 1,
            endDate: 1,
            status: 1,
            approved_by: {
              _id: 1,
              emp_id: '$approved_by.emp_id',
              first_name: '$approved_by.first_name',
              last_name: '$approved_by.last_name',
              email: '$approved_by.email',
            },
            rejection_reason: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ]);

      const filename = `${Date.now()}_leave.csv`;
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

  async todayLeave() {
    try {
      const today = new Date();
      const dd = today.getDate();
      const mm = today.getMonth() + 1;
      const yyyy = today.getFullYear();
      const currentDate = `${mm}/${dd}/${yyyy}`;
      const data = await this.LeavesModel.find({
        $or: [
          {
            $and: [
              {
                startDate: {
                  $lte: new Date(),
                },
              },
              {
                endDate: {
                  $gte: new Date(),
                },
              },
            ],
          },
          {
            $and: [
              {
                startDate: {
                  $eq: new Date(),
                },
              },
            ],
          },
          {
            $and: [
              {
                endDate: {
                  $eq: new Date(),
                },
              },
            ],
          },
        ],
      });
      const successResponse = await createSuccessResponse(
        'Today Leave List',
        data,
        'TODAY_LEAVE_LIST',
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

  async findOneForPermission(id) {
    return await this.LeavesModel.findById(id);
  }

  async findOne(id: string) {
    try {
      const data = await this.LeavesModel.findById(id)
        .populate('applied_by')
        .populate('leave_type')
        .populate('approved_by');

      const userData = await this.UserModel.findById(data.applied_by)
        .populate('reporting_manager')
        .populate('designation')
        .populate('department_id');
      const response = {
        data,
        userData,
      };

      const successResponse = await createSuccessResponse(
        'Leave List',
        response,
        'LEAVE_LIST',
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

  async findLeaveByUserId(id: string) {
    try {
      const data = await this.LeavesModel.find({ applied_by: id })
        .populate('applied_by')
        .populate('leave_type')
        .populate('approved_by');

      const successResponse = await createSuccessResponse(
        'Leave List',
        data,
        'LEAVE_LIST',
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

  async update(id: string, updateLeaveDto: UpdateLeaveDto) {
    try {
      const data = await this.LeavesModel.findByIdAndUpdate(id, updateLeaveDto);
      const successResponse = await createSuccessResponse(
        'Leave Updated Successfully',
        data,
        'LEAVE_UPDATED',
      );
      const userData = await this.UserModel.findById(updateLeaveDto.applied_by);

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
      const leaveData = await this.LeavesModel.findById(id).populate(
        'applied_by',
      );
      if (leaveData && leaveData.status == 'pending') {
        if (leaveData.leave_type == 'loss-of-pay') {
          const updateUser = await this.UserModel.findByIdAndUpdate(
            leaveData.applied_by,
            { $inc: { panelty: -leaveData.leave_amount } },
          );
        } else {
          const updateUserLeave = await this.UserLeaveModel.findOneAndUpdate(
            { _id: leaveData.user_leave_id },
            { $inc: { leave_balance: leaveData.leave_amount } },
          );
        }
        const data = await this.LeavesModel.findByIdAndDelete(id);
        const successResponse = await createSuccessResponse(
          'Leave Deleted Successfully',
          data,
          'LEAVE_DELETED',
        );

        const userData = await this.UserModel.findById(
          leaveData.applied_by,
        ).populate('user_role');
        const notificationData = {
          message: `You deleted ${leaveData.leave_type} leave `,
          user_id: leaveData.applied_by,
          link: userData.avtar,
          action_by: userData._id,
        };
        const notification = await this.notificationService.create(
          notificationData,
        );

        const notificationDataManager = {
          message: `${userData.first_name} ${userData.last_name},has deleted ${leaveData.leave_type} leave `,
          user_id: userData.reporting_manager,
          link: userData.avtar,
          action_by: userData._id,
        };
        const notificationManager = await this.notificationService.create(
          notificationDataManager,
        );

        const allUser = await this.UserModel.find().populate('user_role');

        const admin = await allUser.filter((user) => {
          if (user.user_role) {
            if (
              user.user_role.role_name == 'superAdmin' &&
              !user._id.equals(userData.reporting_manager) &&
              !user._id.equals(userData._id)
            ) {
              return user;
            }
          }
        });
        admin.forEach(async (admin) => {
          const notificationDataAdmin = {
            message: `${userData.first_name} ${userData.last_name}, has deleted ${leaveData.leave_type} leave.`,
            user_id: admin._id,
            link: userData.avtar,
            action_by: userData._id,
          };
          const notificationAdmin = await this.notificationModel.create(
            notificationDataAdmin,
          );
        });

        return successResponse;
      } else {
        return {
          status: false,
          message: 'Leave already approved or rejected',
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

  async approve(id: string, approveLeaveDto: ApproveLeaveDto) {
    try {
      const approveIdVerify = await this.UserModel.findById(
        approveLeaveDto.approved_by,
      ).populate('user_role');
      if (approveIdVerify) {
        const checkStatus = await this.LeavesModel.find({
          _id: id,
          status: 'pending',
        });
        const leaveDetail = await this.LeavesModel.findById(id);
        if (checkStatus.length > 0) {
          let data;
          if (leaveDetail.action_by_status == 'pending') {
            data = await this.LeavesModel.findByIdAndUpdate(id, {
              $set: {
                status: 'approved',
                action_by_status: 'approved',
                approved_by: approveLeaveDto.approved_by,
              },
            });
          } else {
            data = await this.LeavesModel.findByIdAndUpdate(id, {
              $set: {
                status: 'approved',
                approved_by: approveLeaveDto.approved_by,
              },
            });
          }
          const successResponse = await createSuccessResponse(
            'Leave approved Successfully',
            data,
            'LEAVE_APPROVED',
          );
          const userdata = await this.UserModel.findById(
            data.applied_by,
          ).populate('user_role');
          const reportingManagerData = await this.UserModel.findById(
            userdata.reporting_manager,
          );
          const email = userdata.email;
          const notificationData = {
            message: `${approveIdVerify.first_name} ${approveIdVerify.last_name}, has approved your ${data.leave_type} leave `,
            user_id: data.applied_by,
            link: approveIdVerify.avtar,
            action_by: approveLeaveDto.approved_by,
          };
          const notification = await this.notificationService.create(
            notificationData,
          );
          if (userdata.user_role.role_name == 'employee') {
            const notificationDataRm = {
              message: `${approveIdVerify.first_name} ${approveIdVerify.last_name}, has approved ${userdata.first_name} ${userdata.last_name}'s ${data.leave_type} leave  `,
              user_id: userdata.reporting_manager,
              link: approveIdVerify.avtar,
              action_by: approveLeaveDto.approved_by,
            };
            const notificationRm = await this.notificationService.create(
              notificationDataRm,
            );
          }
          const notificationDataRm2 = {
            message: `You, have approved ${userdata.first_name} ${userdata.last_name} ${data.leave_type} leave`,
            user_id: approveIdVerify._id,
            link: approveIdVerify.avtar,
            action_by: approveLeaveDto.approved_by,
          };
          const notificationRm2 = await this.notificationService.create(
            notificationDataRm2,
          );
          const allUser = await this.UserModel.find().populate('user_role');
          // console.log(allUser, 'allUser');

          const admin = await allUser.filter((user) => {
            if (user.user_role) {
              if (
                user.user_role.role_name == 'superAdmin' &&
                !user._id.equals(userdata.reporting_manager) &&
                !user._id.equals(userdata._id) &&
                !user._id.equals(approveLeaveDto.approved_by)
              ) {
                return user;
              }
            }
          });

          admin.forEach(async (admin) => {
            const notificationDataSuper = {
              message: `${approveIdVerify.first_name} ${approveIdVerify.last_name}, has approved ${userdata.first_name} ${userdata.last_name} ${data.leave_type} leave `,
              user_id: admin._id,
              link: approveIdVerify.avtar,
              action_by: approveLeaveDto.approved_by,
            };
            const notificationRm = await this.notificationService.create(
              notificationDataSuper,
            );
            const to = admin.email;
            const subject = 'Leave Approved';
            const user = `${admin.first_name} ${admin.last_name}`;
            const body = ` <p>${approveIdVerify.first_name} ${
              approveIdVerify.last_name
            } has approved ${userdata.first_name} ${userdata.last_name} ${
              data.leave_type
            } leave.</p>
                    <p><b>Leave Type:</b> ${data.leave_type} leave</p>
                    <p><b>Leave Dates:</b>  ${moment(data.startDate).format(
                      'DD-MM-YYYY',
                    )} - ${moment(data.endDate).format('DD-MM-YYYY')}</p>
                    <p><b>No of Days:</b> ${data.leave_amount} Days</p>
                    <p><b>Reason for Leave</b> ${data.reason}</p>`;

            sendMail(to, subject, user, body);
          });
          if (reportingManagerData) {
            const to = reportingManagerData.email;
            const subject = 'Leave Approved';
            const user = `${reportingManagerData.first_name} ${reportingManagerData.last_name}`;
            const body = ` <p>${approveIdVerify.first_name} ${
              approveIdVerify.last_name
            } has approved ${userdata.first_name} ${userdata.last_name} ${
              data.leave_type
            } leave.</p>
                  <p><b>Leave Type:</b> ${data.leave_type} leave</p>
                  <p><b>Leave Dates:</b>  ${moment(data.startDate).format(
                    'DD-MM-YYYY',
                  )} - ${moment(data.endDate).format('DD-MM-YYYY')}</p>
                  <p><b>No of Days:</b> ${data.leave_amount} Days</p>
                  <p><b>Reason for Leave</b> ${data.reason}</p>`;
            sendMail(to, subject, user, body);
          }

          const to = userdata.email;
          const subject = 'Leave Approved';
          const user = `${userdata.first_name} ${userdata.last_name}`;
          const body = ` <p>Your ${
            data.leave_type
          } leave request has been <b>Approved</b> by ${
            approveIdVerify.first_name
          } ${approveIdVerify.last_name}.</p>
          <p><b>Leave Type:</b> ${data.leave_type} leave</p>
          <p><b>Leave Dates:</b>  ${moment(data.startDate).format(
            'DD-MM-YYYY',
          )} - ${moment(data.endDate).format('DD-MM-YYYY')}</p>
          <p><b>No of Days:</b> ${data.leave_amount} Days</p>
          <p><b>Reason for Leave</b> ${data.reason}</p>`;
          sendMail(to, subject, user, body);
          return successResponse;
        } else {
          return {
            status: 'error',
            message: 'Leave already approved or rejected',
          };
        }
      } else {
        return {
          status: 400,
          message: 'Invalid Approved Id',
        };
      }
    } catch (error) {
      return {
        status: false,
        message: 'Something went wrong',
        error: error.message,
      };
    }
  }

  async approveByReportingManager(
    id: string,
    approveLeaveDto: ApproveLeaveDto,
  ) {
    try {
      const approveIdVerify = await this.UserModel.findById(
        approveLeaveDto.approved_by,
      ).populate('user_role');
      const leaveData = await this.LeavesModel.findById(id);
      // console.log(leaveData.applied_by, 'leaveData');
      const userData = await this.UserModel.findById(leaveData.applied_by);
      if (approveLeaveDto.approved_by == userData.reporting_manager) {
        if (approveIdVerify) {
          const checkStatus = await this.LeavesModel.find({
            _id: id,
            action_by_status: 'pending',
          });
          if (checkStatus.length > 0) {
            const data = await this.LeavesModel.findByIdAndUpdate(id, {
              $set: {
                action_by_status: 'approved',
                action_by: approveLeaveDto.approved_by,
              },
            });
            const successResponse = await createSuccessResponse(
              'Leave approved Successfully',
              data,
              'LEAVE_APPROVED',
            );
            const userdata = await this.UserModel.findById(data.applied_by);
            const email = userdata.email;
            const notificationData = {
              message: `${approveIdVerify.first_name} ${approveIdVerify.last_name}, has approved your ${data.leave_type} leave `,
              user_id: data.applied_by,
              link: approveIdVerify.avtar,
              action_by: approveLeaveDto.approved_by,
            };
            const notification = await this.notificationService.create(
              notificationData,
            );
            const notificationDataMan = {
              message: `You, have approved ${userData.first_name} ${userData.last_name} ${data.leave_type} leave `,
              user_id: approveLeaveDto.approved_by,
              link: approveIdVerify.avtar,
              action_by: approveLeaveDto.approved_by,
            };
            const notificationMan = await this.notificationService.create(
              notificationDataMan,
            );
            const allUser = await this.UserModel.find().populate('user_role');
            const admin = await allUser.filter((user) => {
              if (user.user_role) {
                if (
                  user.user_role.role_name == 'superAdmin' &&
                  !user._id.equals(userData.reporting_manager) &&
                  !user._id.equals(userData._id)
                ) {
                  return user;
                }
              }
            });
            admin.forEach(async (admin) => {
              const notificationDataSuper = {
                message: `${approveIdVerify.first_name} ${approveIdVerify.last_name}, has approved ${userData.first_name} ${userData.last_name} ${data.leave_type} leave `,
                user_id: admin._id,
                link: approveIdVerify.avtar,
                action_by: approveLeaveDto.approved_by,
              };
              const notificationRm = await this.notificationService.create(
                notificationDataSuper,
              );
              const to = admin.email;
              const subject = 'Leave Approved By Reporting Manager';
              const user = `${admin.first_name} ${admin.last_name}`;
              const body = ` <p>${approveIdVerify.first_name} ${
                approveIdVerify.last_name
              } has Approved ${userData.first_name} ${userData.last_name} ${
                data.leave_type
              } leave.</p>
                    <p><b>Leave Type:</b> ${data.leave_type} leave</p>
                    <p><b>Leave Dates:</b>  ${moment(data.startDate).format(
                      'DD-MM-YYYY',
                    )} - ${moment(data.endDate).format('DD-MM-YYYY')}</p>
                    <p><b>No of Days:</b> ${data.leave_amount} Days</p>
                    <p><b>Reason for Leave</b> ${data.reason}</p>`;
              sendMail(to, subject, user, body);
            });

            const to = userData.email;
            const subject = 'Leave Approved By Reporting Manager';
            const user = `${userData.first_name} ${userData.last_name}`;
            const body = ` <p>${approveIdVerify.first_name} ${
              approveIdVerify.last_name
            } has approved your ${data.leave_type} leave.</p>
                    <p><b>Leave Type:</b> ${data.leave_type} leave</p>
                    <p><b>Leave Dates:</b>  ${moment(data.startDate).format(
                      'DD-MM-YYYY',
                    )} - ${moment(data.endDate).format('DD-MM-YYYY')}</p>
                    <p><b>No of Days:</b> ${data.leave_amount} Days</p>
                    <p><b>Reason for Leave</b> ${data.reason}</p>`;
            sendMail(to, subject, user, body);

            return successResponse;
          } else {
            return {
              status: 'error',
              message: 'Leave already approved or rejected',
            };
          }
        } else {
          return {
            status: 400,
            message: 'Invalid Approved Id',
          };
        }
      } else {
        return {
          status: 400,
          message: 'Invalid reporting manager Id',
        };
      }
    } catch (error) {
      return {
        status: false,
        message: 'Something went wrong',
        error: error.message,
      };
    }
  }

  async rejectByReportingManager(id: string, rejectLeaveDto: RejectLeaveDto) {
    try {
      const leaveData = await this.LeavesModel.findById(id);
      const userData = await this.UserModel.findById(leaveData.applied_by);
      if (
        rejectLeaveDto.rejection_reason &&
        rejectLeaveDto.rejection_reason.length > 2
      ) {
        console.log(userData, 'rejectLeaveDto.rejection_reason');
        console.log(userData.reporting_manager, 'xyz');
        if (userData.reporting_manager == rejectLeaveDto.approved_by) {
          const rejectIdVerify = await this.UserModel.findById(
            rejectLeaveDto.approved_by,
          );
          if (rejectIdVerify) {
            const leaveData = await this.LeavesModel.findById(id);
            const data = await this.LeavesModel.findByIdAndUpdate(
              id,
              {
                $set: {
                  action_by_status: 'rejected',
                  action_by: rejectLeaveDto.approved_by,
                  rejection_reason_rm: rejectLeaveDto.rejection_reason,
                },
              },
              { new: true },
            );
            const successResponse = await createSuccessResponse(
              'Leave rejected Successfully',
              data,
              'LEAVE_REJECTED',
            );

            const userdata = await this.UserModel.findById(
              leaveData.applied_by,
            );

            const notificationData = {
              message: `${rejectIdVerify.first_name} ${rejectIdVerify.last_name}, has rejected your ${leaveData.leave_type} leave `,
              user_id: leaveData.applied_by,
              link: rejectIdVerify.avtar,
              action_by: rejectLeaveDto.approved_by,
            };
            const notification = await this.notificationService.create(
              notificationData,
            );
            const notificationDataMan = {
              message: `You, have rejected ${userData.first_name} ${userData.last_name} ${leaveData.leave_type} leave `,
              user_id: rejectLeaveDto.approved_by,
              link: rejectIdVerify.avtar,
              action_by: rejectLeaveDto.approved_by,
            };
            const notificationMan = await this.notificationService.create(
              notificationDataMan,
            );
            const allUser = await this.UserModel.find().populate('user_role');
            const admin = await allUser.filter((user) => {
              if (user.user_role) {
                if (
                  user.user_role.role_name == 'superAdmin' &&
                  !user._id.equals(userData.reporting_manager) &&
                  !user._id.equals(userData._id)
                ) {
                  return user;
                }
              }
            });
            admin.forEach(async (admin) => {
              const notificationDataSuper = {
                message: `${rejectIdVerify.first_name} ${rejectIdVerify.last_name}, has rejected ${userData.first_name} ${userData.last_name} ${leaveData.leave_type} leave `,
                user_id: admin._id,
                link: rejectIdVerify.avtar,
                action_by: rejectLeaveDto.approved_by,
              };
              const notificationRm = await this.notificationService.create(
                notificationDataSuper,
              );
              const to = admin.email;
              const subject = 'Leave Rejected By Reporting Manager';
              const user = `${admin.first_name} ${admin.last_name}`;
              const body = `<p>${rejectIdVerify.first_name} ${
                rejectIdVerify.last_name
              } has Rejected ${userData.first_name} ${userData.last_name} ${
                data.leave_type
              } leave.</p>
                      <p><b>Leave Type:</b> ${data.leave_type} leave</p>
                      <p><b>Leave Dates:</b> ${moment(data.startDate).format(
                        'DD-MM-YYYY',
                      )} - ${moment(data.endDate).format('DD-MM-YYYY')}</p>
                      <p><b>No of Days:</b> ${data.leave_amount} Days</p>
                      <p><b>Reason for Leave</b> ${data.reason}</p>
                      <p><b>Reason for Rejection:</b> ${
                        data.rejection_reason
                      }</p>`;
              sendMail(to, subject, user, body);
            });

            const to = userData.email;
            const subject = 'Leave Rejected By Reporting Manager';
            const user = `${userData.first_name} ${userData.last_name}`;
            const body = ` <p>${rejectIdVerify.first_name} ${
              rejectIdVerify.last_name
            } has rejected your ${data.leave_type} leave.</p>
                    <p><b>Leave Type:</b> ${data.leave_type} leave</p>
                    <p><b>Leave Dates:</b>  ${moment(data.startDate).format(
                      'DD-MM-YYYY',
                    )} - ${moment(data.endDate).format('DD-MM-YYYY')}</p>
                    <p><b>No of Days:</b> ${data.leave_amount} Days</p>
                    <p><b>Reason for Leave:</b> ${data.reason}</p>
                    <p><b>Reason for Rejection:</b> ${
                      data.rejection_reason_rm
                    }</p>`;
            sendMail(to, subject, user, body);

            return successResponse;
          } else {
            return {
              status: 400,
              message: 'Invalid Rejected Id',
            };
          }
        } else {
          return {
            status: 400,
            message: 'Invalid reporting manager Id',
          };
        }
      } else {
        return {
          status: 400,
          message: 'Rejection reason should be minimum 3 character',
        };
      }
    } catch (error) {
      return {
        status: false,
        message: 'Something went wrong',
        error: error.message,
      };
    }
    //commenting for development purpose
  }

  async reject(id: string, rejectLeaveDto: RejectLeaveDto) {
    try {
      if (
        rejectLeaveDto.rejection_reason &&
        rejectLeaveDto.rejection_reason.length > 2
      ) {
        const rejectIdVerify = await this.UserModel.findById(
          rejectLeaveDto.approved_by,
        );
        if (rejectIdVerify) {
          const checkStatus = await this.LeavesModel.find({
            _id: id,
            status: 'pending',
          });
          if (checkStatus.length > 0) {
            const leaveData = await this.LeavesModel.findById(id);
            const updateUserLeave = await this.UserLeaveModel.findOneAndUpdate(
              { _id: leaveData.user_leave_id },
              { $inc: { leave_balance: leaveData.leave_amount } },
            );
            let data;
            if (leaveData.action_by_status == 'pending') {
              data = await this.LeavesModel.findByIdAndUpdate(
                id,
                {
                  $set: {
                    status: 'rejected',
                    action_by_status: 'rejected',
                    approved_by: rejectLeaveDto.approved_by,
                    rejection_reason: rejectLeaveDto.rejection_reason,
                  },
                },
                { new: true },
              );
            } else {
              data = await this.LeavesModel.findByIdAndUpdate(
                id,
                {
                  $set: {
                    status: 'rejected',
                    approved_by: rejectLeaveDto.approved_by,
                    rejection_reason: rejectLeaveDto.rejection_reason,
                  },
                },
                { new: true },
              );
            }
            const successResponse = await createSuccessResponse(
              'Leave rejected Successfully',
              data,
              'LEAVE_REJECTED',
            );

            const userData = await this.UserModel.findById(
              leaveData.applied_by,
            );
            const reportingManagerData = await this.UserModel.findById(
              userData.reporting_manager,
            );

            const notificationData = {
              message: `${rejectIdVerify.first_name} ${rejectIdVerify.last_name}, has rejected your ${leaveData.leave_type} leave `,
              user_id: leaveData.applied_by,
              link: rejectIdVerify.avtar,
              action_by: rejectLeaveDto.approved_by,
            };
            const notification = await this.notificationService.create(
              notificationData,
            );
            const notificationDataMan = {
              message: `You, have rejected ${userData.first_name} ${userData.last_name} ${leaveData.leave_type} leave `,
              user_id: rejectLeaveDto.approved_by,
              link: rejectIdVerify.avtar,
              action_by: rejectLeaveDto.approved_by,
            };
            const notificationMan = await this.notificationService.create(
              notificationDataMan,
            );
            const allUser = await this.UserModel.find().populate('user_role');
            const admin = await allUser.filter((user) => {
              if (user.user_role) {
                if (
                  user.user_role.role_name == 'superAdmin' &&
                  !(user._id.str == userData.reporting_manager) &&
                  !(user._id.str == userData._id.str) &&
                  !user._id.equals(rejectLeaveDto.approved_by)
                ) {
                  return user;
                }
              }
            });
            admin.forEach(async (admin) => {
              const notificationDataSuper = {
                message: `${rejectIdVerify.first_name} ${rejectIdVerify.last_name}, has rejected ${userData.first_name} ${userData.last_name} ${leaveData.leave_type} leave `,
                user_id: admin._id,
                link: rejectIdVerify.avtar,
                action_by: rejectLeaveDto.approved_by,
              };
              const notificationRm = await this.notificationService.create(
                notificationDataSuper,
              );
            });
            if (reportingManagerData) {
              const to = reportingManagerData.email;
              const subject = 'Leave Rejected';
              const user = `${reportingManagerData.first_name} ${reportingManagerData.last_name}`;
              const body = `  <p>${rejectIdVerify.first_name} ${
                rejectIdVerify.last_name
              } has Rejected ${userData.first_name} ${userData.last_name} ${
                data.leave_type
              } leave.</p>
                    <p><b>Leave Type:</b> ${data.leave_type} leave</p>
                    <p><b>Leave Dates:</b> ${moment(data.startDate).format(
                      'DD-MM-YYYY',
                    )} - ${moment(data.endDate).format('DD-MM-YYYY')}</p>
                    <p><b>No of Days:</b> ${data.leave_amount} Days</p>
                    <p><b>Reason for Leave</b> ${data.reason}</p>
                    <p><b>Reason for Rejection:</b> ${
                      data.rejection_reason
                    }</p>`;
              sendMail(to, subject, user, body);
            }

            const email = userData.email;
            const to = email;
            const subject = 'Leave Rejected';
            const user = `${userData.first_name} ${userData.last_name}`;
            const body = ` <p>${rejectIdVerify.first_name} ${
              rejectIdVerify.last_name
            } has Rejected your ${data.leave_type} leave.</p>
                    <p><b>Leave Type:</b> ${data.leave_type} leave</p>
                    <p><b>Leave Dates:</b>  ${moment(data.startDate).format(
                      'DD-MM-YYYY',
                    )} - ${moment(data.endDate).format('DD-MM-YYYY')}</p>
                    <p><b>No of Days:</b> ${data.leave_amount} Days</p>
                    <p><b>Reason for Leave</b> ${data.reason}</p>
                    <p><b>Reason for Rejection:</b> ${
                      data.rejection_reason
                    }</p>`;
            sendMail(to, subject, user, body);
            return successResponse;
          } else {
            return {
              status: 'error',
              message: 'Leave already approved or rejected',
            };
          }
        } else {
          return {
            status: 400,
            message: 'Invalid Rejected Id',
          };
        }
      } else {
        return {
          status: 400,
          message: 'Rejection reason should be minimum 3 character',
        };
      }
    } catch (error) {
      return {
        status: false,
        message: 'Something went wrong',
        error: error.message,
      };
    }
    //commenting for development purpose
  }
  async pending(id: string) {
    console.log(id);
    try {
      const leaveData = await this.LeavesModel.findById(id);
      if (leaveData && leaveData.status === 'approved') {
        const updateLeave = await this.LeavesModel.findByIdAndUpdate(
          id,
          { $set: { status: 'pending' } },
          { new: true },
        );
        const successResponse = await createSuccessResponse(
          'Leave pending successfully',
          updateLeave,
          'LEAVE_PENDING',
        );
        const userData = await this.UserModel.findById(leaveData.applied_by);
        const reportingManagerData = await this.UserModel.findById(
          userData.reporting_manager,
        );

        const notificationData = {
          message: `Your, ${leaveData.leave_type} leave is change to pending`,
          user_id: leaveData.applied_by,
          link: userData.avtar,
          action_by: userData._id,
        };
        const notification = await this.notificationService.create(
          notificationData,
        );
        const notificationDataMan = {
          message: `${userData.first_name} ${userData.last_name}, ${leaveData.leave_type} leave is change to pending`,
          user_id: reportingManagerData._id,
          link: userData.avtar,
          action_by: userData._id,
        };
        const notificationMan = await this.notificationService.create(
          notificationDataMan,
        );
        const allUser = await this.UserModel.find().populate('user_role');
        const admin = await allUser.filter((user) => {
          if (user.user_role) {
            if (
              user.user_role.role_name == 'superAdmin' &&
              !(user._id.str == userData.reporting_manager) &&
              !(user._id.str == userData._id.str)
            ) {
              return user;
            }
          }
        });
        admin.forEach(async (admin) => {
          const notificationDataSuper = {
            message: `${userData.first_name} ${userData.last_name}, ${leaveData.leave_type} leave is change to pending`,
            user_id: admin._id,
            link: userData.avtar,
            action_by: userData._id,
          };
          const notificationRm = await this.notificationService.create(
            notificationDataSuper,
          );
        });
        return successResponse;
      } else {
        return {
          status: 400,
          message: 'Leave not found',
        };
      }
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        message: 'Something went wrong',
        error: error.message,
      };
    }
  }
  async pendingByRm(id: string) {
    // console.log(id);
    try {
      const leaveData = await this.LeavesModel.findById(id);
      if (leaveData && leaveData.action_by_status === 'approved') {
        const updateLeave = await this.LeavesModel.findByIdAndUpdate(
          id,
          { $set: { action_by_status: 'pending' } },
          { new: true },
        );
        const successResponse = await createSuccessResponse(
          'Leave pending successfully',
          updateLeave,
          'LEAVE_PENDING',
        );
        const userData = await this.UserModel.findById(leaveData.applied_by);
        const reportingManagerData = await this.UserModel.findById(
          userData.reporting_manager,
        );

        const notificationData = {
          message: `Your, ${leaveData.leave_type} leave is change to pending`,
          user_id: leaveData.applied_by,
          link: userData.avtar,
          action_by: userData._id,
        };
        const notification = await this.notificationService.create(
          notificationData,
        );
        const notificationDataMan = {
          message: `${userData.first_name} ${userData.last_name}, ${leaveData.leave_type} leave is change to pending`,
          user_id: reportingManagerData._id,
          link: userData.avtar,
          action_by: userData._id,
        };
        const notificationMan = await this.notificationService.create(
          notificationDataMan,
        );
        const allUser = await this.UserModel.find().populate('user_role');
        const admin = await allUser.filter((user) => {
          if (user.user_role) {
            if (
              user.user_role.role_name == 'superAdmin' &&
              !(user._id.str == userData.reporting_manager) &&
              !(user._id.str == userData._id.str)
            ) {
              return user;
            }
          }
        });
        admin.forEach(async (admin) => {
          const notificationDataSuper = {
            message: `${userData.first_name} ${userData.last_name}, ${leaveData.leave_type} leave is change to pending`,
            user_id: admin._id,
            link: userData.avtar,
            action_by: userData._id,
          };
          const notificationRm = await this.notificationService.create(
            notificationDataSuper,
          );
        });
        return successResponse;
      } else {
        return {
          status: 400,
          message: 'Leave not found or it is not approved',
        };
      }
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        message: 'Something went wrong',
        error: error.message,
      };
    }
  }

  async filterLeaves(query: any) {
    try {
      const limit = query.limit || 10;
      const skip = query.skip || 0;

      const queryToPass = [];
      if (query) {
        queryToPass.push(
          {
            $match: {
              applied_by: query.applied_by
                ? new mongoose.Types.ObjectId(query.applied_by)
                : { $exists: true },
            },
          },
          // {$sort: {createdAt: -1}},
          {
            $lookup: {
              from: 'users',
              localField: 'applied_by',
              foreignField: '_id',
              as: 'applied_by',
            },
          },
          {
            $unwind: {
              path: '$applied_by',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'approved_by',
              foreignField: '_id',
              as: 'approved_by',
            },
          },
          {
            $unwind: {
              path: '$approved_by',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'departments',
              localField: 'applied_by.department',
              foreignField: '_id',
              as: 'applied_by.department',
            },
          },
          {
            $unwind: {
              path: '$applied_by.department',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'action_by',
              foreignField: '_id',
              as: 'action_by',
            },
          },
          {
            $unwind: {
              path: '$action_by',
              preserveNullAndEmptyArrays: true,
            },
          },

          {
            $project: {
              _id: 1,
              leave_type: 1,
              leave_amount: 1,
              applied_by: {
                _id: 1,
                emp_id: '$applied_by.emp_id',
                first_name: '$applied_by.first_name',
                last_name: '$applied_by.last_name',
                email: '$applied_by.email',
                avtar: '$applied_by.avtar',
              },
              startDateLeaveType: 1,
              endDateLeaveType: 1,
              reason: 1,
              startDate: 1,
              endDate: 1,
              status: 1,
              action_by_status: 1,
              action_by: {
                _id: 1,
                first_name: '$action_by.first_name',
                last_name: '$action_by.last_name',
                email: '$action_by.email',
              },
              approved_by: {
                _id: 1,
                emp_id: '$approved_by.emp_id',
                first_name: '$approved_by.first_name',
                last_name: '$approved_by.last_name',
                email: '$approved_by.email',
              },
              rejection_reason: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },

          { $sort: { createdAt: query.createdAt ? 1 : -1 } },
        );
      }

      if (query.status) {
        queryToPass.push({
          $match: {
            $or: [
              {
                status: { $regex: query.status, $options: 'i' },
              },
            ],
          },
        });
      }
      if (query.keyword && query.keyword != '') {
        queryToPass.push({
          $match: {
            $or: [
              {
                'applied_by.first_name': {
                  $regex: query.keyword,
                  $options: 'i',
                },
              },
              {
                'applied_by.last_name': {
                  $regex: query.keyword,
                  $options: 'i',
                },
              },
              {
                'applied_by.emp_id': { $regex: query.keyword, $options: 'i' },
              },
            ],
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
      const data = await this.LeavesModel.aggregate(queryToPass);
      const successResponse = await createSuccessResponse(
        'Leave List',
        data,
        'LEAVE_LIST',
      );
      return successResponse;
    } catch (error) {
      return {
        status: false,
        message: 'Something went wrong',
        error: error.message,
      };
    }
  }
  async filterLeavesReportingManager(id, query: any) {
    try {
      const userData = await this.UserModel.find({
        reporting_manager: id,
      }).select('_id');
      const userId = [];
      userData.map((item) => {
        userId.push(item._id);
      });
      // console.log(userId);
      const limit = query.limit || 10;
      const skip = query.skip || 0;

      const queryToPass = [];
      if (query) {
        queryToPass.push(
          { $match: { applied_by: { $in: userId } } },
          {
            $lookup: {
              from: 'users',
              localField: 'applied_by',
              foreignField: '_id',
              as: 'applied_by',
            },
          },
          {
            $unwind: {
              path: '$applied_by',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'approved_by',
              foreignField: '_id',
              as: 'approved_by',
            },
          },
          {
            $unwind: {
              path: '$approved_by',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'action_by',
              foreignField: '_id',
              as: 'action_by',
            },
          },
          {
            $unwind: {
              path: '$action_by',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 1,
              leave_type: 1,
              leave_amount: 1,
              applied_by: {
                _id: 1,
                emp_id: '$applied_by.emp_id',
                first_name: '$applied_by.first_name',
                last_name: '$applied_by.last_name',
                email: '$applied_by.email',
                avtar: '$applied_by.avtar',
                reporting_manager: '$applied_by.reporting_manager',
              },
              startDateLeaveType: 1,
              endDateLeaveType: 1,
              reason: 1,
              startDate: 1,
              endDate: 1,
              status: 1,
              action_by_status: 1,
              action_by: {
                _id: 1,
                first_name: '$action_by.first_name',
                last_name: '$action_by.last_name',
              },
              approved_by: {
                _id: 1,
                emp_id: '$approved_by.emp_id',
                first_name: '$approved_by.first_name',
                last_name: '$approved_by.last_name',
                email: '$approved_by.email',
              },
              rejection_reason: 1,
              rejection_reason_rm: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
          { $sort: { createdAt: query.createdAt ? 1 : -1 } },
        );
      }
      if (query.status) {
        queryToPass.push({
          $match: {
            action_by_status: { $regex: query.status, $options: 'i' },
          },
        });
      }
      if (query.keyword && query.keyword != '') {
        queryToPass.push({
          $match: {
            $or: [
              {
                'applied_by.first_name': {
                  $regex: query.keyword,
                  $options: 'i',
                },
              },
              {
                'applied_by.last_name': {
                  $regex: query.keyword,
                  $options: 'i',
                },
              },
              {
                'applied_by.email': { $regex: query.keyword, $options: 'i' },
              },
              {
                'applied_by.emp_id': { $regex: query.keyword, $options: 'i' },
              },
            ],
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
      const data = await this.LeavesModel.aggregate(queryToPass);
      const successResponse = await createSuccessResponse(
        'Leave List',
        data,
        'LEAVE_LIST',
      );
      return successResponse;
    } catch (error) {
      return {
        status: false,
        message: 'Something went wrong',
        error: error.message,
      };
    }
  }

  async email() {
    try {
      const futureLeave = [],
        todayLeave = [];
      const data = await this.LeavesModel.find({ status: 'approved' })
        .populate('applied_by')
        .sort({ startDate: 1 });

      //today date logic
      const today = new Date();
      const dd = today.getDate();
      const mm = today.getMonth() + 1;
      const yyyy = today.getFullYear();
      const currentDate = `${yyyy}/${mm}/${dd}`;
      const realDate = currentDate.split('/');
      data.forEach((leave) => {
        // leave.status == 'approved'
        if (leave.startDate && leave.endDate) {
          //start date logic
          const dd1 = leave.startDate.getDate();
          const mm1 = leave.startDate.getMonth() + 1;
          const yyyy1 = leave.startDate.getFullYear();
          const startDate1 = `${yyyy1}/${mm1}/${dd1}`;
          const startDate = startDate1.split('/');
          //enddate logic
          const dd2 = leave.endDate.getDate();
          const mm2 = leave.endDate.getMonth() + 1;
          const yyyy2 = leave.endDate.getFullYear();
          const endDate1 = `${yyyy2}/${mm2}/${dd2}`;
          const endDate = endDate1.split('/');

          const dateToday = moment(realDate);
          const dateStartDate = moment(startDate);
          const dateEndDate = moment(endDate);
          const resultStartDate = dateStartDate.diff(dateToday, 'days');
          const resultEndDate = dateEndDate.diff(dateToday, 'days');

          if (resultStartDate > 0 || resultEndDate > 0) {
            futureLeave.push(leave);
          }
          if (resultStartDate == 0 || resultEndDate == 0) {
            todayLeave.push(leave);
          }
        }
      });
      const applied_by = futureLeave.map((item) => item.applied_by);
      const unique = applied_by.filter((v, i) => applied_by.indexOf(v) === i);
      const newObjForFutureLeave = {};
      for (let i = 0; i < unique.length; i++) {
        const temp = [];
        for (let j = 0; j < futureLeave.length; j++) {
          if (unique[i]._id == futureLeave[j].applied_by._id) {
            temp.push(futureLeave[j]);
          }
        }
        newObjForFutureLeave[`${unique[i].first_name} ${unique[i].last_name}`] =
          {
            ...temp,
          };
      }
      let futureLeaveEmployeeString = '';
      for (const key in newObjForFutureLeave) {
        const st = moment(newObjForFutureLeave[key][0].startDate).format(
          'DD-MM-YYYY',
        );
        const ed = moment(newObjForFutureLeave[key][0].endDate).format(
          'DD-MM-YYYY',
        );
        if (st == ed) {
          futureLeaveEmployeeString += `<p>${key} : ${st} </p>`;
        } else {
          futureLeaveEmployeeString += `<p>${key} : ${st} to ${ed} </p>`;
        }
      }

      const todayLeaveAppliedBy = todayLeave.map((item) => item.applied_by);
      const uniqueTodayLeave = todayLeaveAppliedBy.filter(
        (v, i) => todayLeaveAppliedBy.indexOf(v) === i,
      );

      const newObjForTodayLeave = {};
      for (let i = 0; i < uniqueTodayLeave.length; i++) {
        const temp = [];
        for (let j = 0; j < todayLeave.length; j++) {
          if (uniqueTodayLeave[i]._id == todayLeave[j].applied_by._id) {
            temp.push(todayLeave[j]);
          }
        }
        newObjForTodayLeave[
          `${uniqueTodayLeave[i].first_name} ${uniqueTodayLeave[i].last_name}`
        ] = {
          ...temp,
        };
      }
      let todayLeaveEmployeeStringFirstHalf = '';
      let todayLeaveEmployeeStringSecondHalf = '';
      let todayLeaveEmployeeStringFullDay = '';
      for (const key in newObjForTodayLeave) {
        if (newObjForTodayLeave[key][0].startDateLeaveType == 'full-day') {
          todayLeaveEmployeeStringFullDay += `${key},\n`;
        }
        if (newObjForTodayLeave[key][0].startDateLeaveType == 'first-half') {
          todayLeaveEmployeeStringFirstHalf += `${key},\n`;
        }
        if (newObjForTodayLeave[key][0].startDateLeaveType == 'second-half') {
          todayLeaveEmployeeStringSecondHalf += `${key},\n`;
        }
      }

      const allUserEmail = await this.UserModel.find({}).select('email');
      let emailString = '';
      for (let i = 0; i < allUserEmail.length; i++) {
        emailString += ` ${allUserEmail[i].email},`;
      }
      const body = ` <p>Greetings of the day!</p>
                     <p>Please find below the list of Absent Employees,</p>
                    <p><b>Full-Day Absent employees:-:</b></p>
                  <p> ${todayLeaveEmployeeStringFullDay}</p>
                    <p><b>First Half Absent Employee:-</b></p>
                   <p> ${
                     todayLeaveEmployeeStringFirstHalf
                       ? todayLeaveEmployeeStringFirstHalf
                       : '------------------------'
                   }</p>
                    <p><b>Second Half Absent Employee:-</b></p>
                    <p> ${
                      todayLeaveEmployeeStringSecondHalf
                        ? todayLeaveEmployeeStringSecondHalf
                        : '-----------------------'
                    }</p>
                    <p><b>Employees on Leaves (In Future):-</b></p>
                   ${futureLeaveEmployeeString}`;
      const to = emailString;
      const subject = 'Absent Report';
      const user = 'All';
      await sendMail(to, subject, user, body);
      return {
        status: true,
        message: 'Email sent successfully',
      };
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
