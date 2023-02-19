import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TimesheetDocument } from 'src/schemas/timesheet.schema';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { UpdateTimesheetDto } from './dto/update-timesheet.dto';
import { Timesheet } from './entities/timesheet.entity';
import { Model } from 'mongoose';
import { createSuccessResponse } from 'src/helper/success.helper';
import { ErrorLog } from 'src/helper/error.helper';
import { UserDocument, Users } from 'src/schemas/user.schema';
import { Project, ProjectDocument } from 'src/schemas/project.schema';
import { getDay } from 'src/helper/common.helper';
import * as moment from 'moment';
import { FilterTimesheetDto } from './dto/filter-timesheet.dto';
import mongoose from 'mongoose';
import { sendMail } from 'src/helper/mail.helper';

@Injectable()
export class TimesheetService {
  constructor(
    @InjectModel(Timesheet.name)
    private TimesheetModel: Model<TimesheetDocument>,
    @InjectModel(Users.name)
    private UserModel: Model<UserDocument>,
    @InjectModel(Project.name)
    private ProjectModel: Model<ProjectDocument>,
  ) {}

  async create(createTimesheetDto: CreateTimesheetDto) {
    try {
      const userCheck = await this.UserModel.findById(
        createTimesheetDto.user_id,
      );
      const projectCheck = await this.ProjectModel.findById(
        createTimesheetDto.project,
      );
      if (!userCheck) {
        return {
          status: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND',
        };
      }
      if (createTimesheetDto.type == 'worked') {
        if (!projectCheck) {
          return {
            status: false,
            message: 'Project not found',
            error: 'PROJECT_NOT_FOUND',
          };
        }
      }
      createTimesheetDto['day'] = await getDay(createTimesheetDto.date);
      createTimesheetDto['date'] = moment(createTimesheetDto.date).format(
        'YYYY-MM-DD',
      );
      const data = await this.TimesheetModel.create(createTimesheetDto);
      const successResponse = await createSuccessResponse(
        'Timesheet created successfully',
        data,
        'TIMESHEET_CREATED',
      );
      return successResponse;
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        message: 'something went wrong',
        error: error,
      };
    }
  }

  async findAll(id: string, query: any) {
    try {
      const limit = query.limit || 31;
      const skip = query.skip || 0;
      const queryToPass = [];
      const startDate = moment(query.startDate).format('YYYY-MM-DD');
      const endDate = moment(query.endDate).format('YYYY-MM-DD');
      console.log(new Date(startDate), new Date(endDate));
      if (query) {
        queryToPass.push(
          {
            $match: {
              user_id: new mongoose.Types.ObjectId(id),
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user',
            },
          },
          {
            $unwind: {
              path: '$user',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'projects',
              localField: 'project',
              foreignField: '_id',
              as: 'project',
            },
          },
          {
            $unwind: {
              path: '$project',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $sort: { createdAt: query.createdAt ? 1 : -1 },
          },
          {
            $project: {
              _id: 1,
              user_id: 1,
              first_name: '$user.first_name',
              last_name: '$user.last_name',
              full_name: {
                $concat: ['$user.first_name', ' ', '$user.last_name'],
              },
              email: '$user.email',
              project_name: '$project.title',
              task: 1,
              date: 1,
              status: 1,
              type: 1,
              rejection_reason: 1,
              is_submitted: 1,
              custom: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
        );
      }
      if (query.keyword && query.keyword != '') {
        queryToPass.push({
          $match: {
            full_name: { $regex: query.keyword, $options: 'i' },
          },
        });
      }
      if (query.startDate && query.endDate) {
        queryToPass.push({
          $match: {
            date: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
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
      const data = await this.TimesheetModel.aggregate(queryToPass);
      const successResponse = await createSuccessResponse(
        'Timesheet found successfully',
        data,
        'TIMESHEET_FOUND',
      );
      return successResponse;
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        message: 'something went wrong',
        error: error,
      };
    }
  }

  findOne(id: string) {
    return `This action returns a #${id} timesheet`;
  }

  async update(id: string, updateTimesheetDto: UpdateTimesheetDto) {
    try {
      const statusCheck = await this.TimesheetModel.findById(id);
      if (statusCheck && statusCheck.status != 'approved') {
        let updates = {};
        if (updateTimesheetDto.type == 'worked') {
          updates = {
            type: updateTimesheetDto.type,
            date: updateTimesheetDto.date,
            custom: updateTimesheetDto.custom,
            task: updateTimesheetDto.task,
            project: updateTimesheetDto.project,
          };
        } else if (
          updateTimesheetDto.type == 'leave' ||
          updateTimesheetDto.type == 'holiday'
        ) {
          updates = {
            type: updateTimesheetDto.type,
            date: updateTimesheetDto.date,
            custom: '',
            task: '',
          };
        } else {
          return {
            success: false,
            message: 'please enter valid type',
          };
        }
        const data = await this.TimesheetModel.findByIdAndUpdate(id, updates, {
          new: true,
        });
        const successResponse = createSuccessResponse(
          'Timesheet updated successfully',
          data,
          'TIMESHEET_UPDATED',
        );
        return successResponse;
      } else {
        return {
          status: false,
          message: 'Timesheet is already approved',
          error: 'TIMESHEET_APPROVED',
        };
      }
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        message: 'something went wrong',
        error: error,
      };
    }
  }

  async isSubmitted(id: string, query: any) {
    try {
      const startDate = query.startDate;
      const endDate = query.endDate;
      const reportingManager = await this.UserModel.findById(id);
      const rmData = await this.UserModel.findById(
        reportingManager.reporting_manager,
      );

      const data = await this.TimesheetModel.updateMany(
        {
          user_id: id,
          date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
        {
          $set: {
            is_submitted: true,
          },
        },
      );
      const to = rmData.email;
      const subject = 'Timesheet Submitted';
      const user = `${rmData.first_name} ${rmData.last_name}`;
      const body = `
      <p>${reportingManager.first_name} ${reportingManager.last_name}  has submitted timesheet.</p>
      <p>Please login to your account and review the timesheet.</p>`;
      await sendMail(to, subject, user, body);
      //list out superAdmin email from user model
      const allUser = await this.UserModel.find().populate('user_role');
      const admin = await allUser.filter((user) => {
        if (user.user_role) {
          if (
            user.user_role.role_name == 'superAdmin' &&
            !(user._id.str == reportingManager.reporting_manager)
          ) {
            return user;
          }
        }
      });
      let emailOfSuperAdmin = '';
      admin.forEach((user) => {
        emailOfSuperAdmin += `${user.email},`;
      });
      if (emailOfSuperAdmin != '' && emailOfSuperAdmin.length > 1) {
        const to = emailOfSuperAdmin;
        const subject = 'Timesheet Submitted';
        const user = '';
        const body = `  <p>${reportingManager.first_name} ${reportingManager.last_name}  has submitted timesheet.</p>
        <p>Please login to your account and review the timesheet.</p>`;
        await sendMail(to, subject, user, body);
      }

      const successResponse = createSuccessResponse(
        'Timesheet updated successfully',
        data,
        'TIMESHEET_UPDATED',
      );
      return successResponse;
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        message: 'something went wrong',
        error: error,
      };
    }
  }

  async statusUpdate(id: string, query: any) {
    try {
      const updates = {
        status: query.status,
      };
      if (query.status === 'rejected') {
        if (query.rejection_reason.length >= 10) {
          updates['rejection_reason'] = query.rejection_reason;
        } else {
          return {
            status: false,
            message: 'Rejection reason should be atleast 10 characters',
            error: 'REJECTION_REASON_SHOULD_BE_ATLEAST_10_CHARACTERS',
          };
        }
      }
      // update all timesheet of user with id between startDate and endDate
      const data = await this.TimesheetModel.updateMany(
        {
          user_id: id,
          date: {
            $gte: new Date(query.startDate),
            $lte: new Date(query.endDate),
          },
        },
        {
          $set: updates,
        },
      );
      const userData = await this.UserModel.findById(id);
      const to = userData.email,
        subject = `Timesheet ${query.status}`,
        user = `${userData.first_name} ${userData.last_name}`,
        body = `<p>Your Timesheet has been ${query.status}.</p>
      <p>From: ${moment(query.startDate).format('DD-MM-YYYY')}
      <p>To: ${moment(query.endDate).format('DD-MM-YYYY')}
      `;
      await sendMail(to, subject, user, body);

      const successResponse = createSuccessResponse(
        'Timesheet updated successfully',
        data,
        'TIMESHEET_UPDATED',
      );
      return successResponse;
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        message: 'something went wrong',
        error: error,
      };
    }
  }

  remove(id: string) {
    return `This action removes a #${id} timesheet`;
  }

  async monthWiseTimesheet(id: string, query: any) {
    try {
      const year = query.year ? query.year : new Date().getFullYear();
      const queryToPass = [];
      queryToPass.push(
        {
          $match: {
            user_id: new mongoose.Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'projects',
            localField: 'project',
            foreignField: '_id',
            as: 'project',
          },
        },
        {
          $unwind: {
            path: '$project',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            is_submitted: 1,
            status: 1,
            day: 1,
            task: 1,
            custom: 1,
            rejection_reason: 1,
            type: 1,
            user_id: 1,
            date: 1,
            createdAt: 1,
            updatedAt: 1,
            project: '$project.title',
            first_name: '$user.first_name',
            last_name: '$user.last_name',
            email: '$user.email',
          },
        },
        //match date year with year
        {
          $match: {
            date: {
              $gte: new Date(year + '-01-01'),
              $lte: new Date(year + '-12-31'),
            },
          },
        },
        {
          $sort: {
            date: 1,
          },
        },
        {
          $group: {
            _id: {
              $month: '$date',
            },
            data: { $push: '$$ROOT' },
          },
        },
        {
          $sort: {
            _id: -1,
          },
        },
        {
          $project: {
            _id: 1,
            data: 1,
            status: { $arrayElemAt: ['$data.status', 0] },
            rejection_reason: { $arrayElemAt: ['$data.rejection_reason', 0] },
            is_submitted: { $arrayElemAt: ['$data.is_submitted', 0] },
          },
        },
      );
      if (query.is_submitted) {
        queryToPass.push({
          $match: {
            is_submitted: true,
          },
        });
      }
      const data = await this.TimesheetModel.aggregate(queryToPass);
      const successResponse = createSuccessResponse(
        'Timesheet found successfully',
        data,
        'TIMESHEET_FOUND',
      );
      return successResponse;
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        message: 'something went wrong',
        error: error,
      };
    }
  }

  async warningTimesheet() {
    try {
      const users = await this.UserModel.find({ status: 'active' });

      const date = new Date();
      date.setDate(date.getDate() - 7);
      const startDate = date;
      const endDate = new Date();
      console.log(startDate, endDate);
      const queryToPass = [];
      //find the users who has not add timesheet in last 5 days

      const data = await this.TimesheetModel.aggregate([
        {
          $match: {
            date: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        //unique user_id
        {
          $group: {
            _id: '$user_id',
          },
        },
      ]);
      console.log(data);
      const userIds = data.map((item) => item._id.toString());
      const emp = users.map((user) => user._id.toString());
      // filter out matched id from userIds and emp
      const filteredEmp = emp.filter((id) => !userIds.includes(id));
      const filteredEmp2 = emp.filter((id) => userIds.includes(id));
      let emailString = '';
      users.forEach((user) => {
        if (filteredEmp.includes(user._id.toString())) {
          emailString += user.email + ',';
        }
      });
      console.log(emailString);
      const to = emailString;
      const subject = 'Missed Timesheet';
      const body = `<p>You are not adding timesheet regularly. Please add timesheet regularly.</p>`;
      const user = 'there';
      await sendMail(to, subject, user, body);
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        message: 'something went wrong',
        error: error,
      };
    }
  }

  async remindTimesheetSubmit() {
    try {
      //get current month
      const today = new Date();
      //find fifth day of current month form last.
      const lastDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0,
      );
      const fifthDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        lastDayOfMonth.getDate() - 4,
      );
      if (
        moment(today).format('DD-MM-YYYY') ===
          moment(lastDayOfMonth).format('DD-MM-YYYY') ||
        moment(today).format('DD-MM-YYYY') ===
          moment(fifthDayOfMonth).format('DD-MM-YYYY')
      ) {
        //get all users_id whose timesheet is not submitted in cureent month and currentYear
        //get current month and current year
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const userIds = await this.TimesheetModel.aggregate([
          {
            $match: {
              date: {
                $gte: new Date(currentYear + '-' + (currentMonth + 1) + '-01'),
                $lte: new Date(
                  currentYear +
                    '-' +
                    (currentMonth + 1) +
                    '-' +
                    lastDayOfMonth.getDate(),
                ),
              },
            },
          },
          {
            $group: {
              _id: '$user_id',
            },
          },
        ]);
        const userIds2 = userIds.map((item) => item._id.toString());
        const users = await this.UserModel.find({ _id: { $in: userIds2 } });
        let emailString = '';
        users.forEach((user) => {
          emailString += user.email + ',';
        });
        const to = emailString;
        const subject = 'Timesheet Reminder';
        const body = `<p>Please submit your timesheet for the current month.</p>`;
        const user = '';
        await sendMail(to, subject, user, body);
      }
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        message: 'something went wrong',
        error: error,
      };
    }
  }
}
