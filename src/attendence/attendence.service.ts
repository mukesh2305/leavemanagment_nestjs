import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AttendenceDocument } from 'src/schemas/attendence.schema';
import { Report, ReportDocument } from 'src/schemas/report.schema';
import { Users, UserDocument } from 'src/schemas/user.schema';
import { CreateAttendenceDto } from './dto/create-attendence.dto';
import { UpdateAttendenceDto } from './dto/update-attendence.dto';
import { Attendence } from './entities/attendence.entity';
import { Model } from 'mongoose';
import { createSuccessResponse } from 'src/helper/success.helper';
import * as moment from 'moment';
import * as fastcsv from 'fast-csv';
import * as fs from 'fs';
import mongoose from 'mongoose';
import * as nodemailer from 'nodemailer';
import {
  NotificationDocument,
  Notification,
} from 'src/schemas/notification.schema';
import { ErrorLog } from 'src/helper/error.helper';
import { isWeekend } from 'src/helper/common.helper';
import { HolidayDocument, Holidays } from 'src/schemas/holiday.schema';
import { sendMail } from 'src/helper/mail.helper';
import { LeaveDocument, Leaves } from 'src/schemas/leave.schema';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

@Injectable()
export class AttendenceService {
  constructor(
    @InjectModel(Users.name) private UserModel: Model<UserDocument>,
    @InjectModel(Attendence.name)
    private AttendenceModel: Model<AttendenceDocument>,
    @InjectModel(Report.name) private ReportModel: Model<ReportDocument>,
    @InjectModel(Notification.name)
    private NotificationModel: Model<NotificationDocument>,
    @InjectModel(Holidays.name)
    private HolidaysModel: Model<HolidayDocument>,
    @InjectModel(Leaves.name)
    private LeavesModel: Model<LeaveDocument>,
  ) {}

  // msToHMS(ms) {
  //   let seconds = Math.round(ms / 1000);

  //   const hours = Math.round(seconds / 3600); // 3,600 seconds in 1 hour
  //   seconds = seconds % 3600; // seconds remaining after extracting hours

  //   const minutes = Math.round(seconds / 60); // 60 seconds in 1 minute

  //   seconds = Math.round(seconds % 60);
  //   return `${hours}:${minutes}:${seconds}`;
  // }
  msToHMS(ms) {
    // 1- Convert to seconds:
    ms = parseInt(ms);
    let seconds = ms / 1000;

    // 2- Extract hours:
    const hours = parseInt(`${seconds / 3600}`); // 3600 seconds in 1 hour
    seconds = parseInt(`${seconds % 3600}`); // extract the remaining seconds after extracting hours

    // 3- Extract minutes:
    const minutes = parseInt(`${seconds / 60}`); // 60 seconds in 1 minute

    // 4- Keep only seconds not extracted to minutes:
    seconds = parseInt(`${seconds % 60}`);

    // 5 - Format so it shows a leading zero if needed
    const hoursStr = ('00' + hours).slice(-2);
    const minutesStr = ('00' + minutes).slice(-2);
    const secondsStr = ('00' + seconds).slice(-2);

    return hoursStr + ':' + minutesStr + ':' + secondsStr;
  }

  async sendEmail(Attendence): Promise<any> {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: `${Attendence.email}`,
      subject: `Forgot Clock Out`,
      html: `<div id=":n3" class="ii gt" jslog="20277; u014N:xr6bB; 4:W251bGwsbnVsbCxbXV0.">
      <div id=":n2" class="a3s aiL">
        <div class="adM"></div>
        <u></u>
    
        <div bgcolor="#E1E1E1" marginwidth="0" marginheight="0">
          <div
            style="
              max-width: 600px;
              background: #fff;
              border: 1px solid #dbdbdb;
              margin: 20px auto;
            "
          >
            <img style="width: 100%" />
            <div style="padding-left: 10px; padding-bottom: 20px">
              <h3
                style="
                  font-size: 24px;
                  color: #c20006;
                  margin-top: 20px;
                  text-transform: capitalize;
                "
              >
                Hello ${Attendence.first_name} ${Attendence.last_name},
              </h3>
              

              <p>You may forgot to clock out ,Please make sure to  clocked out before you leave.</p>
             
              <div>
                <p style="margin: 0">Regards,</p>
                <p style="margin: 0">${process.env.APP_NAME}</p>
                <div class="yj6qo"></div>
                <div class="adL"></div>
              </div>
              <div class="adL"></div>
            </div>
            <div class="adL"></div>
          </div>
          <div class="adL"></div>
        </div>
        <div class="adL"></div>
      </div>
    </div>
    `,
      text: '',
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    return 'Email sent';
  }
  async sendEmailForAdmin(Attendence): Promise<any> {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: `${Attendence.email}`,
      subject: `Forgot Clock Out`,
      html: `<div id=":n3" class="ii gt" jslog="20277; u014N:xr6bB; 4:W251bGwsbnVsbCxbXV0.">
      <div id=":n2" class="a3s aiL">
        <div class="adM"></div>
        <u></u>
    
        <div bgcolor="#E1E1E1" marginwidth="0" marginheight="0">
          <div
            style="
              max-width: 600px;
              background: #fff;
              border: 1px solid #dbdbdb;
              margin: 20px auto;
            "
          >
            <img style="width: 100%" />
            <div style="padding-left: 10px; padding-bottom: 20px">
              <h3
                style="
                  font-size: 24px;
                  color: #c20006;
                  margin-top: 20px;
                  text-transform: capitalize;
                "
              >
                Hello ${Attendence.admin_first_name} ${Attendence.admin_last_name},
              </h3>
              

              <p>${Attendence.first_name} ${Attendence.last_name} forgot to clock out.</p>
             
              <div>
                <p style="margin: 0">Regards,</p>
                <p style="margin: 0">${process.env.APP_NAME}</p>
                <div class="yj6qo"></div>
                <div class="adL"></div>
              </div>
              <div class="adL"></div>
            </div>
            <div class="adL"></div>
          </div>
          <div class="adL"></div>
        </div>
        <div class="adL"></div>
      </div>
    </div>
    `,
      text: '',
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    return 'Email sent';
  }

  async create(createAttendenceDto: CreateAttendenceDto) {
    try {
      const userCheck = await this.UserModel.findOne({
        _id: createAttendenceDto.user_id,
      });
      const attendenceData = await this.AttendenceModel.find({
        user_id: createAttendenceDto.user_id,
      }).sort({ createdAt: -1 });
      console.log(attendenceData, 'attendenceData');
      if (!userCheck) {
        return {
          status: false,
          message: 'User not found',
        };
      }
      let createAttendence;
      const data = {
        user_id: createAttendenceDto.user_id,
        date: new Date(),
        // time: Date.now(),
      };
      if (attendenceData.length > 0) {
        if (attendenceData[0].is_clockin) {
          // data.is_clockin = false;
          Object.assign(data, { is_clockin: false });
          Object.assign(data, { is_clockout: true });
          Object.assign(data, {
            clockout_location: createAttendenceDto.location,
          });
          const clockOutTime = Date.now();
          const clocInTime = attendenceData[0].time;
          const diff = Math.abs(clockOutTime - clocInTime);
          const seconds = diff;
          Object.assign(data, { total_time: seconds });
          Object.assign(data, { clockout_time: clockOutTime });
          Object.assign(data, { time: clocInTime });
          createAttendence = await this.AttendenceModel.findByIdAndUpdate(
            attendenceData[0]._id,
            data,
            { new: true },
          );
        } else {
          Object.assign(data, { is_clockin: true });
          Object.assign(data, { time: Date.now() });
          Object.assign(data, {
            clockin_location: createAttendenceDto.location,
          });
          createAttendence = await this.AttendenceModel.create(data);
        }
      } else {
        Object.assign(data, { is_clockin: true });
        Object.assign(data, { time: Date.now() });
        Object.assign(data, {
          clockin_location: createAttendenceDto.location,
        });
        createAttendence = await this.AttendenceModel.create(data);
      }
      const successResponse = await createSuccessResponse(
        'attendence created',
        createAttendence,
        'ATTENDENCE_CREATED',
      );
      return successResponse;
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        message: 'Error in creating attendence',
        error: error,
      };
    }
  }

  async getAttendence() {
    try {
      const today = new Date();
      const date = moment(today).format('YYYY-MM-DD');
      const attendence = await this.AttendenceModel.find({
        date: { $gte: date },
        is_clockout: false,
      });
      console.log(attendence, 'attendence');
      let userList = '';
      for (let i = 0; i < attendence.length; i++) {
        const user = await this.UserModel.findOne({
          _id: attendence[i].user_id,
        });
        console.log(user.first_name, user.last_name, 'clockedout');
        userList += `${user.first_name} ${user.last_name}, \n`;

        const userTimestamp = Date.now();
        const diff = userTimestamp - attendence[i].time;
        const seconds = diff;
        const updates = {
          is_clockout: true,
          is_clockin: false,
          clockout_location: 'anonymous',
          clockout_time: userTimestamp,
          is_manual: true,
          total_time: seconds,
        };
        const updateAttendence = await this.AttendenceModel.findByIdAndUpdate(
          attendence[i]._id,
          updates,
          { new: true },
        );
        // console.log(updateAttendence, 'updateAttendence');
        const notificationData = {
          message: `You, have been clocked out `,
          user_id: user._id,
          link: `/attendence`,
          action_by: user._id,
        };

        const notification = await this.NotificationModel.create(
          notificationData,
        );
        // let emailString = '';

        // for (let j = 0; j < admin.length; j++) {
        //   emailString += ' ' + admin[j].email + ',';
        // }
        // const userString =''
        // if(attendence.length > 0){
        //   for (let k = 0; k < attendence.length; k++) {
        //     userString += ' ' + attendence[k].first_name + ' ' + attendence[k].last_name, ',';

        // if (user.reporting_manager) {
        //   const notificationDataRM = {
        //     message: `${user.first_name} ${user.last_name}, have been clocked out `,
        //     user_id: user.reporting_manager,
        //     link: `/attendence`,
        //     action_by: user._id,
        //   };

        //   const notificationRM = await this.NotificationModel.create(
        //     notificationDataRM,
        //   );
        // }
        // const reportingManager = await this.UserModel.findOne({
        //   _id: user.reporting_manager,
        // });

        const emailData = {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          // ...updateAttendence,
        };
        // console.log(emailData, 'emailData');
        await this.sendEmail(emailData);
        // let emailDataRM;
        // if (reportingManager) {
        //   emailDataRM = {
        //     first_name: user.first_name,
        //     admin_first_name: reportingManager.first_name,
        //     admin_last_name: reportingManager.last_name,
        //     last_name: user.last_name,
        //     email: reportingManager.email,
        //     // ...updateAttendence,
        //   };
        // }
        // console.log(emailDataRM, 'emailDataRM');
        // await this.sendEmailForAdmin(emailDataRM);
        // const allUser = await this.UserModel.find().populate('user_role');
        // // console.log(allUser, 'allUser');
        // const admin = await allUser.filter((User) => {
        //   if (User.user_role) {
        //     if (
        //       User.user_role.role_name == 'superAdmin' &&
        //       !User._id.equals(user.reporting_manager)
        //     ) {
        //       return User;
        //     }
        //   }
        // });
        // console.log(admin, 'admin');
        // admin.forEach(async (admin) => {
        //   // console.log(user,"user")
        //   const notificationDataAdmin = {
        //     message: `${user.first_name} ${user.last_name}, has been clocked out `,
        //     user_id: admin._id,
        //     link: `/attendence`,
        //     action_by: user._id,
        //   };
        //   await this.NotificationModel.create(notificationDataAdmin);
        //   // console.log("ck")

        //   const emailData = {
        //     first_name: user.first_name,
        //     admin_first_name: admin.first_name,
        //     admin_last_name: admin.last_name,
        //     last_name: user.last_name,
        //     email: admin.email,
        //     // ...updateAttendence,
        //   };
        //   // console.log(emailData, 'emailData');
        //   this.sendEmailForAdmin(emailData);
        // });
      }
      if (userList.length > 0) {
        const allUser = await this.UserModel.find().populate('user_role');
        // console.log(allUser, 'allUser');
        const admin = await allUser.filter((User) => {
          if (User.user_role) {
            if (User.user_role.role_name == 'superAdmin') {
              return User;
            }
          }
        });
        let emailString = '';
        for (let j = 0; j < admin.length; j++) {
          emailString += ' ' + admin[j].email + ',';
        }
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: emailString,
          subject: 'Clocked Out',
          html: `<div id=":n3" class="ii gt" jslog="20277; u014N:xr6bB; 4:W251bGwsbnVsbCxbXV0.">
        <div id=":n2" class="a3s aiL">
          <div class="adM"></div>
          <u></u>
          
          <div bgcolor="#E1E1E1" marginwidth="0" marginheight="0">
            <div
              style="
              max-width: 600px;
              background: #fff;
                border: 1px solid #dbdbdb;
                margin: 20px auto;
              "
            >
              <img style="width: 100%" />
              <div style="padding-left: 10px; padding-bottom: 20px">
                <h3
                  style="
                    font-size: 24px;
                    color: #c20006;
                    margin-top: 20px;
                    text-transform: capitalize;
                    "
                >
                  Hello All,
                </h3>
                
  
                <p>Some employee may forgot to clock out ,Please make sure to clocked out before they leave.</p>
                <p>${userList}</p>
               
                <div>
                  <p style="margin: 0">Regards,</p>
                  <p style="margin: 0">${process.env.APP_NAME}</p>
                  <div class="yj6qo"></div>
                  <div class="adL"></div>
                </div>
                <div class="adL"></div>
              </div>
              <div class="adL"></div>
            </div>
            <div class="adL"></div>
          </div>
          <div class="adL"></div>
        </div>
        </div>
      `,
          text: '',
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
      }
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        message: 'Error in finding attendence',
        error: error,
      };
    }
  }
  async getAttendenceDownload(id: string, query: any) {
    try {
      // console.log(id, 'id');
      const today = new Date();
      const currentMonth = moment(today).format('MM');
      const currentYear = moment(today).format('YYYY');
      const month = parseInt(query.month);
      const year = parseInt(query.year);
      const userData = await this.UserModel.findOne({ _id: id });
      const queryToPass = [];
      queryToPass.push(
        {
          $match: {
            user_id: new mongoose.Types.ObjectId(id),
          },
        },
        // group by date and match the data with query.month
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$date',
                },
              },
            },
            attendence: { $push: '$$ROOT' },
            total_time: { $sum: '$total_time' },
          },
        },
        {
          $project: {
            _id: 0,
            date: '$_id.date',
            month: { $month: { $dateFromString: { dateString: '$_id.date' } } },
            year: { $year: { $dateFromString: { dateString: '$_id.date' } } },
            // month: { $substr: ['$_id.date', 5, 6] },
            // year: { $substr: ['$_id.date', 0, 4] },
            attendence: 1,
            total_time: 1,
          },
        },
      );

      if (query.month) {
        queryToPass.push({
          $match: {
            month: month,
          },
        });
      }
      if (query.year) {
        queryToPass.push({
          $match: {
            year: year,
          },
        });
      }
      queryToPass.push({
        $sort: {
          date: -1,
        },
      });

      const attendence = await this.AttendenceModel.aggregate(queryToPass);
      // console.log('attendence', attendence);
      for (let i = 0; i < attendence.length; i++) {
        attendence[i]['user_name'] =
          userData.first_name + ' ' + userData.last_name;
        attendence[i].total_time = this.msToHMS(attendence[i].total_time);
        attendence[i].date = moment(attendence[i].date).format('DD-MM-YYYY');
        for (let j = 0; j < attendence[i].attendence.length; j++) {
          if (attendence[i].attendence[j].is_manual) {
            attendence[i]['is_corrupted'] = true;
          }
        }
      }

      const filename = `${Date.now()}_user.csv`;
      const ws = await fs.createWriteStream(`./uploads/${filename}`);
      await fastcsv
        .write(attendence, {
          headers: ['user_name', 'date', 'total_time', 'is_corrupted'],
        })
        .on('finish', function () {
          // console.log('stream finished);
          // console.log(leaveRules, 'leaveRules');
          console.log('Write to fastcsv.csv successfully!');
        })
        .pipe(ws);
      return {
        status: true,
        file: filename,
      };
    } catch (error) {
      ErrorLog(error);
      console.log(error);
      return {
        status: false,
        message: 'Error in finding attendence',
        error: error,
      };
    }
  }

  async findAll(query: any) {
    try {
      const limit = query.limit || 10;
      const skip = query.skip || 0;
      const queryToPass = [];
      queryToPass.push(
        {
          $group: {
            _id: '$user_id',
            attendence: { $push: '$$ROOT' },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: '$user',
          // preserveNullAndEmptyArrays: true,
        },
        {
          $project: {
            _id: '$user._id',
            first_name: '$user.first_name',
            last_name: '$user.last_name',
            fullname: { $concat: ['$user.first_name', ' ', '$user.last_name'] },
            email: '$user.email',
            avtar: '$user.avtar',
            attendence: '$attendence',
          },
        },
        {
          $sort: { fullname: query.createdAt ? -1 : 1 },
        },
      );
      if (query.keyword && query.keyword != '') {
        // console.log(query.keyword, 'query.keyword');
        queryToPass.push({
          $match: {
            fullname: { $regex: query.keyword, $options: 'i' },
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

      const userAttendence = await this.AttendenceModel.aggregate(queryToPass);
      console.log(userAttendence, 'userAttendence');
      userAttendence[0].result.map((user) => {
        const attendence = user.attendence;
        const uniqueDates = [];
        for (let i = 0; i < attendence.length; i++) {
          const date = moment(attendence[i].date).format('YYYY-MM-DD');
          if (!uniqueDates.includes(date)) {
            uniqueDates.push(date);
          }
        }
        const data = [];
        for (let i = 0; i < uniqueDates.length; i++) {
          const date = uniqueDates[i];
          const session = [];
          for (let j = 0; j < attendence.length; j++) {
            const attendenceDate = moment(attendence[j].date).format(
              'YYYY-MM-DD',
            );
            if (date === attendenceDate) {
              session.push(attendence[j]);
            }
          }
          let totalTime = 0;
          const lastLocation = session[session.length - 1].clockout_location
            ? session[session.length - 1].clockout_location
            : 'still clock in';
          const lastClockinLocation =
            session[session.length - 1].clockin_location;
          const lastClockinTime = session[session.length - 1].time;
          const lastClockoutTime = session[session.length - 1].clockout_time
            ? session[session.length - 1].clockout_time
            : 0;

          for (let j = 0; j < session.length; j++) {
            if (session[j].total_time) {
              totalTime += session[j].total_time;
            }
          }
          // const getISTTime = (d) => {
          //   return d.getMilliseconds() + 5.5 * 60 * 60 * 1000;
          // };
          function msToHMS(ms) {
            // 1- Convert to seconds:
            ms = parseInt(ms);
            let seconds = ms / 1000;

            // 2- Extract hours:
            const hours = parseInt(`${seconds / 3600}`); // 3600 seconds in 1 hour
            seconds = parseInt(`${seconds % 3600}`); // extract the remaining seconds after extracting hours

            // 3- Extract minutes:
            const minutes = parseInt(`${seconds / 60}`); // 60 seconds in 1 minute

            // 4- Keep only seconds not extracted to minutes:
            seconds = parseInt(`${seconds % 60}`);

            // 5 - Format so it shows a leading zero if needed
            const hoursStr = ('00' + hours).slice(-2);
            const minutesStr = ('00' + minutes).slice(-2);
            const secondsStr = ('00' + seconds).slice(-2);

            return hoursStr + ':' + minutesStr + ':' + secondsStr;
          }
          // lastClockoutTime = msToHMS(`${lastClockoutTime}`);
          // console.log(
          //   lastClockinTime,
          //   lastClockoutTime,
          //   'lastClockinTime, lastClockoutTime',
          // );
          const totalTimeInFormat = msToHMS(`${totalTime}`);

          data.push({
            date: date,
            total_time: totalTimeInFormat,
            clockin_location: lastClockinLocation,
            clockout_location: lastLocation,
            clockin_time: lastClockinTime,
            clockout_time: lastClockoutTime,
          });
          // session: session,
        }
        // console.log(data, 'data');
        user.attendence = data;
      });

      const successResponse = await createSuccessResponse(
        'attendence found',
        userAttendence,
        'ATTENDENCE_FOUND',
      );
      return successResponse;
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        message: 'Error in finding attendence',
        error: error,
      };
    }
  }
  async findAllByReportingManager(id: string, query: any) {
    try {
      const userData = await this.UserModel.find({
        reporting_manager: id,
      }).select('_id');
      const userId = [];
      userData.map((item) => {
        userId.push(item._id);
      });
      console.log(userId);
      const limit = query.limit || 10;
      const skip = query.skip || 0;
      const queryToPass = [];
      queryToPass.push(
        {
          $match: {
            user_id: { $in: userId },
          },
        },
        {
          $group: {
            _id: '$user_id',
            attendence: { $push: '$$ROOT' },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: '$user',
          // preserveNullAndEmptyArrays: true,
        },
        {
          $project: {
            _id: '$user._id',
            first_name: '$user.first_name',
            last_name: '$user.last_name',
            fullname: { $concat: ['$user.first_name', ' ', '$user.last_name'] },
            email: '$user.email',
            avtar: '$user.avtar',
            attendence: '$attendence',
          },
        },
        {
          $sort: { fullname: query.createdAt ? 1 : -1 },
        },
      );
      if (query.keyword && query.keyword != '') {
        // console.log(query.keyword, 'query.keyword');
        queryToPass.push({
          $match: {
            fullname: { $regex: query.keyword, $options: 'i' },
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

      const userAttendence = await this.AttendenceModel.aggregate(queryToPass);
      // const userAttendence = await this.AttendenceModel.find({
      //   user_id: { $in: userId },
      // });
      console.log(userAttendence, 'userAttendence');
      userAttendence[0].result.map((user) => {
        const attendence = user.attendence;
        const uniqueDates = [];
        for (let i = 0; i < attendence.length; i++) {
          const date = moment(attendence[i].date).format('YYYY-MM-DD');
          if (!uniqueDates.includes(date)) {
            uniqueDates.push(date);
          }
        }
        const data = [];
        for (let i = 0; i < uniqueDates.length; i++) {
          const date = uniqueDates[i];
          const session = [];
          for (let j = 0; j < attendence.length; j++) {
            const attendenceDate = moment(attendence[j].date).format(
              'YYYY-MM-DD',
            );
            if (date === attendenceDate) {
              session.push(attendence[j]);
            }
          }
          let totalTime = 0;
          const lastLocation = session[session.length - 1].clockout_location
            ? session[session.length - 1].clockout_location
            : 'still clock in';
          const lastClockinLocation =
            session[session.length - 1].clockin_location;
          const lastClockinTime = session[session.length - 1].time;
          const lastClockoutTime = session[session.length - 1].clockout_time
            ? session[session.length - 1].clockout_time
            : 0;

          for (let j = 0; j < session.length; j++) {
            if (session[j].total_time) {
              totalTime += session[j].total_time;
            }
          }
          // const getISTTime = (d) => {
          //   return d.getMilliseconds() + 5.5 * 60 * 60 * 1000;
          // };
          function msToHMS(ms) {
            // 1- Convert to seconds:
            ms = parseInt(ms);
            let seconds = ms / 1000;

            // 2- Extract hours:
            const hours = parseInt(`${seconds / 3600}`); // 3600 seconds in 1 hour
            seconds = parseInt(`${seconds % 3600}`); // extract the remaining seconds after extracting hours

            // 3- Extract minutes:
            const minutes = parseInt(`${seconds / 60}`); // 60 seconds in 1 minute

            // 4- Keep only seconds not extracted to minutes:
            seconds = parseInt(`${seconds % 60}`);

            // 5 - Format so it shows a leading zero if needed
            const hoursStr = ('00' + hours).slice(-2);
            const minutesStr = ('00' + minutes).slice(-2);
            const secondsStr = ('00' + seconds).slice(-2);

            return hoursStr + ':' + minutesStr + ':' + secondsStr;
          }
          // lastClockoutTime = msToHMS(`${lastClockoutTime}`);
          // console.log(
          //   lastClockinTime,
          //   lastClockoutTime,
          //   'lastClockinTime, lastClockoutTime',
          // );
          const totalTimeInFormat = msToHMS(`${totalTime}`);

          data.push({
            date: date,
            total_time: totalTimeInFormat,
            clockin_location: lastClockinLocation,
            clockout_location: lastLocation,
            clockin_time: lastClockinTime,
            clockout_time: lastClockoutTime,
          });
          // session: session,
        }
        // console.log(data, 'data');
        user.attendence = data;
      });

      const successResponse = await createSuccessResponse(
        'attendence found',
        userAttendence,
        'ATTENDENCE_FOUND',
      );
      return successResponse;
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        message: 'Error in finding attendence',
        error: error,
      };
    }
  }

  async findByUserId(id: string, query: any) {
    try {
      const limit = query.limit || 10;
      const skip = query.skip || 0;
      const attendence = await this.AttendenceModel.aggregate([
        {
          $match: {
            user_id: new mongoose.Types.ObjectId(id),
          },
        },
      ]);
      //   .sort({ date: -1 })
      //   .limit(parseInt(limit))
      //   .skip(parseInt(skip));

      function msToHMS(ms) {
        // 1- Convert to seconds:
        ms = parseInt(ms);
        let seconds = ms / 1000;

        // 2- Extract hours:
        const hours = parseInt(`${seconds / 3600}`); // 3600 seconds in 1 hour
        seconds = parseInt(`${seconds % 3600}`); // extract the remaining seconds after extracting hours

        // 3- Extract minutes:
        const minutes = parseInt(`${seconds / 60}`); // 60 seconds in 1 minute

        // 4- Keep only seconds not extracted to minutes:
        seconds = parseInt(`${seconds % 60}`);

        // 5 - Format so it shows a leading zero if needed
        const hoursStr = ('00' + hours).slice(-2);
        const minutesStr = ('00' + minutes).slice(-2);
        const secondsStr = ('00' + seconds).slice(-2);

        return hoursStr + ':' + minutesStr + ':' + secondsStr;
      }
      for (let i = 0; i < attendence.length; i++) {
        if (attendence[i].total_time) {
          const totalTime = attendence[i].total_time;
          // attendence[i]['clockout_location2'] = 'vipul';
          const data = msToHMS(`${totalTime}`);
          Object.assign(attendence[i], { final_time: data });
        }
        // console.log(attendence[i]['finalTime'], 'attendence[i][finalTime]');
        // console.log(attendence[i], 'attendence[i]');
      }

      const uniqueDates = [];
      for (let i = 0; i < attendence.length; i++) {
        const date = moment(attendence[i].date).format('YYYY-MM-DD');
        if (!uniqueDates.includes(date)) {
          uniqueDates.push(date);
        }
      }
      const data = [];
      for (let i = 0; i < uniqueDates.length; i++) {
        const date = uniqueDates[i];
        const session = [];
        for (let j = 0; j < attendence.length; j++) {
          // const dd = msToHMS(`${attendence[j].total_time}`);
          // console.log(dd,'dd')
          // Object.assign(attendence[j], { final: dd });
          const attendenceDate = moment(attendence[j].date).format(
            'YYYY-MM-DD',
          );

          if (date === attendenceDate) {
            // console.log(dd, 'attendence[j].total_time');
            // attendence[j]['total_time2'] = dd;
            session.push(attendence[j]);
            // console.log(attendence[j], 'attendence[j]');
          }
        }
        let totalTime = 0;
        const lastLocation = session[session.length - 1].clockout_location
          ? session[session.length - 1].clockout_location
          : 'still clock in';
        const lastClockinLocation =
          session[session.length - 1].clockin_location;
        const lastClockinTime = session[session.length - 1].time;
        const lastClockoutTime = session[session.length - 1].clockout_time
          ? session[session.length - 1].clockout_time
          : 0;

        for (let j = 0; j < session.length; j++) {
          if (session[j].total_time) {
            totalTime += session[j].total_time;
          }
        }
        // lastClockinTime = moment(lastClockinTime).format('HH:mm:ss');
        // lastClockoutTime = moment(lastClockoutTime).format('HH:mm:ss');

        const totalTimeInFormat = msToHMS(`${totalTime}`);
        data.push({
          date: date,
          total_time: totalTimeInFormat,
          clockin_location: lastClockinLocation,
          clockout_location: lastLocation,
          clockin_time: lastClockinTime,
          clockout_time: lastClockoutTime,
          session: session,
        });
      }
      // console.log(data, 'data');

      const successResponse = await createSuccessResponse(
        'attendence found',
        data,
        'ATTENDENCE_FOUND',
      );
      return successResponse;
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        message: 'Error in finding attendence',
        error: error,
      };
    }
  }
  async findLastTimeByUser(id: string) {
    try {
      const attendence = await this.AttendenceModel.find({ user_id: id }).sort({
        createdAt: -1,
      });

      if (attendence[0].is_clockin) {
        const lastTime = attendence[0].time;
        const data = {
          time: lastTime,
          user_id: id,
        };
        const successResponse = await createSuccessResponse(
          'last time found',
          data,
          'LAST_TIME_FOUND',
        );
        return successResponse;
      } else {
        return {
          status: false,
          message: 'you are not clock in',
        };
      }
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        message: 'Error in finding attendence',
        error: error,
      };
    }
  }

  async userAttendenceDownload(id: string, query: any) {
    // export user attendence monthly group by date in excel
    try {
      console.log(id, 'id');
      const month = query.month || 7;
      const year = query.year || 2022;
      const attendence = await this.AttendenceModel.aggregate([
        {
          $match: {
            user_id: id,
          },
        },
        // { $expr: { $eq: [{ $month: '$date' }, month] } },
        // {
        //   $group: {
        //     _id: {
        //       date: {
        //         $dateToString: {
        //           format: '%Y-%m-%d',
        //           date: '$date',
        //         },
        //       },
        //     },
        //     attendence: {
        //       $push: '$$ROOT',
        //     },
        //   },
        // },
        // {
        //   $project: {
        //     date: '$date',
        //     is_clockin: '$attendence.is_clockin',
        //     is_clockout: '$attendence.is_clockout',
        //     clockin_location: '$attendence.clockin_location',
        //     clockout_location: '$attendence.clockout_location',
        //     clockin_time: '$attendence.time',
        //     clockout_time: '$attendence.clockout_time',
        //     total_time: '$attendence.total_time',
        //     month: { $month: '$date' },
        //     year: { $year: '$date' },
        //   },
        // },
        // {
        //   //match month and year
        //   $match: {
        //     month: month,
        //     year: year,
        //   },
        // },
      ]);
      console.log('attendence', attendence);
      return attendence;
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        message: 'Error in finding attendence',
        error: error,
      };
    }
  }

  async dayAnalysis() {
    const users = await this.UserModel.find();
    const date = moment(new Date()).format('YYYY-MM-DD');

    // const attendence = await this.AttendenceModel.find({
    //   date: { $gte: date },
    // })
    const attendence = await this.AttendenceModel.aggregate([
      //list the data whose date is date of the event
      {
        $addFields: {
          todayDate: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' },
          },
        },
      },
      { $match: { todayDate: { $eq: date } } },
      //group the data by user_id
      {
        $group: {
          _id: '$user_id',
          attendence: {
            $push: '$$ROOT',
          },
          total_time: {
            $sum: '$total_time',
          },
          is_clockout: {
            $push: '$is_clockout',
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          _id: '$_id',
          first_name: '$user.first_name',
          last_name: '$user.last_name',
          total_time: '$total_time',
          is_clockout: '$is_clockout',
        },
      },

      //total_time is greaterthan 28800000
      {
        $match: {
          total_time: { $lte: 28800000 },
        },
      },
    ]);
    const allAttendence = await this.AttendenceModel.aggregate([
      //list the data whose date is date of the event
      {
        $addFields: {
          todayDate: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' },
          },
        },
      },
      { $match: { todayDate: { $eq: date } } },
      //group the data by user_id
      {
        $group: {
          _id: '$user_id',
          attendence: {
            $push: '$$ROOT',
          },
          total_time: {
            $sum: '$total_time',
          },
          is_clockout: {
            $push: '$is_clockout',
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          _id: '$_id',
          first_name: '$user.first_name',
          last_name: '$user.last_name',
          total_time: '$total_time',
          is_clockout: '$is_clockout',
        },
      },
    ]);
    function msToHMS(ms) {
      // 1- Convert to seconds:
      ms = parseInt(ms);
      let seconds = ms / 1000;

      // 2- Extract hours:
      const hours = parseInt(`${seconds / 3600}`); // 3600 seconds in 1 hour
      seconds = parseInt(`${seconds % 3600}`); // extract the remaining seconds after extracting hours

      // 3- Extract minutes:
      const minutes = parseInt(`${seconds / 60}`); // 60 seconds in 1 minute

      // 4- Keep only seconds not extracted to minutes:
      seconds = parseInt(`${seconds % 60}`);

      // 5 - Format so it shows a leading zero if needed
      const hoursStr = ('00' + hours).slice(-2);
      const minutesStr = ('00' + minutes).slice(-2);
      const secondsStr = ('00' + seconds).slice(-2);

      return hoursStr + ':' + minutesStr + ':' + secondsStr;
    }
    console.log(attendence, 'attendence');

    // console.log(msToHMS(28800000));
    let clockOutMiss = '';
    let lessTime = '';
    for (let i = 0; i < attendence.length; i++) {
      if (
        attendence[i].is_clockout[attendence[i].is_clockout.length - 1] ===
        false
      ) {
        clockOutMiss += `<p>${attendence[i].first_name} ${attendence[i].last_name} (missed clock out), </p>`;
      } else {
        const time = msToHMS(attendence[i].total_time);
        lessTime += `<p>${attendence[i].first_name} ${attendence[i].last_name} (worked ${time}), </p>`;
      }
    }
    let abscent = '';

    const allUser = await this.UserModel.find()
      .populate('user_role')
      .select('_id first_name last_name user_role email');
    const abscentUser = allUser.filter((employee) => {
      const isAbscent = allAttendence.find((attendence) => {
        return attendence._id.toString() === employee._id.toString();
      });
      if (!isAbscent) {
        return employee;
      }
    });
    for (let i = 0; i < abscentUser.length; i++) {
      abscent += `<p>${abscentUser[i].first_name} ${abscentUser[i].last_name} (missed clock in), </p>`;
    }
    // console.log(allUser, 'allUser');
    const admin = await allUser.filter((User) => {
      if (User.user_role) {
        if (User.user_role.role_name == 'superAdmin') {
          return User;
        }
      }
    });
    let emailString = '';
    for (let j = 0; j < admin.length; j++) {
      emailString += ' ' + admin[j].email + ',';
    }
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emailString,
      subject: "Today's Attandence Report",
      html: `<div id=":n3" class="ii gt" jslog="20277; u014N:xr6bB; 4:W251bGwsbnVsbCxbXV0.">
      <div id=":n2" class="a3s aiL">
        <div class="adM"></div>
        <u></u>
    
        <div bgcolor="#E1E1E1" marginwidth="0" marginheight="0">
          <div
            style="
              max-width: 600px;
              background: #fff;
              border: 1px solid #dbdbdb;
              margin: 20px auto;
            "
          >
            <img style="width: 100%" />
            <div style="padding-left: 10px; padding-bottom: 20px">
              <h3
                style="
                  font-size: 24px;
                  color: #c20006;
                  margin-top: 20px;
                  text-transform: capitalize;
                "
              >
                Hello All,
              </h3>
              

              <p><b>Today's Attandence Analysis</b></p>
              <p><b>Date</b>:${date}</p>
              <p>Missed Clock Out</p>
              ${clockOutMiss ? clockOutMiss : 'No Missed Clock Out'}
              <p><b>----------------------------</b></p>
              <p><b>Work Less than 8 hours</b></p>
              ${lessTime ? lessTime : 'No Work Less than 8 hours'}
              <p><b>----------------------------</b></p>
              <p><b>Missed Clock In (Absent)</b></p>
              ${abscent ? abscent : 'No Missed Clock In'}
             
              <div>
                <p style="margin: 0">Regards,</p>
                <p style="margin: 0">${process.env.APP_NAME}</p>
                <div class="yj6qo"></div>
                <div class="adL"></div>
              </div>
              <div class="adL"></div>
            </div>
            <div class="adL"></div>
          </div>
          <div class="adL"></div>
        </div>
        <div class="adL"></div>
      </div>
    </div>
    `,
      text: '',
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }
  async missedClockInRemainder() {
    const users = await this.UserModel.find();
    const date = moment(new Date()).format('YYYY-MM-DD');
    const allAttendence = await this.AttendenceModel.aggregate([
      //list the data whose date is date of the event
      {
        $addFields: {
          todayDate: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' },
          },
        },
      },
      { $match: { todayDate: { $eq: date } } },
      //group the data by user_id
      {
        $group: {
          _id: '$user_id',
          attendence: {
            $push: '$$ROOT',
          },
          total_time: {
            $sum: '$total_time',
          },
          is_clockout: {
            $push: '$is_clockout',
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          _id: '$_id',
          first_name: '$user.first_name',
          last_name: '$user.last_name',
          total_time: '$total_time',
          is_clockout: '$is_clockout',
        },
      },
    ]);
    const weekend = await isWeekend(new Date());
    const holiday = await this.HolidaysModel.find({});

    const holidayDate = holiday.filter(
      (holiday) =>
        moment(holiday.holiday_date).format('DD-MM-YYYY') ==
        moment(new Date()).format('DD-MM-YYYY'),
    );
    let holidayFlag = false;
    if (holidayDate.length > 0) {
      holidayFlag = true;
    }

    if (weekend == false && holidayFlag == false) {
      let abscent = '';
      // find the users who are on leave todayDate:
      const onLeave = await this.LeavesModel.find({
        startDate: { $lte: date },
        endDate: { $gte: date },
      });
      const usersOnLeave = onLeave.map((leave) => leave.applied_by.toString());
      const userClockIn = allAttendence.filter((attendence) =>
        attendence._id.toString(),
      );
      //merge both array usersOnLeave and userClockIn
      const excludeUsers = usersOnLeave.concat(userClockIn);

      const userToRemind = await this.UserModel.find({
        _id: { $nin: excludeUsers },
      });
      for (let i = 0; i < userToRemind.length; i++) {
        abscent += ` ${userToRemind[i].email},`;
      }
      const to = abscent;
      const subject = 'Missed Clock In Remainder';
      const user = 'there';
      const body = ` <h3>  You have missed to clock in for today.Please clock in if you are working today. </h3>
      <h3>Date : ${date}</h3>`;
      await sendMail(to, subject, user, body);
    }
  }
}
