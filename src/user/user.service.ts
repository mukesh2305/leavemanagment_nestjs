import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from '../schemas/user.schema';
import { Users } from '../schemas/user.schema'; //

import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as moment from 'moment';
import 'dotenv/config';
import * as fastcsv from 'fast-csv';
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as csv from 'csvtojson';

import { AssignLeaveUserDto } from './dto/assign-leave-user-dto';
import { createSuccessResponse } from 'src/helper/success.helper';
import { PersonalInfoDto } from './dto/personal-info.dto';

import { WorkDto } from './dto/work-user.dto';
import { ConfigService } from '@nestjs/config';
import { Department, DepartmentDocument } from 'src/schemas/department.schema';
import { RoleDocument, Roles } from 'src/schemas/role.schema';
import { UserLeaveService } from 'src/user-leave/user-leave.service';
import { UserLeave, UserLeaveDocument } from 'src/schemas/user.leave.schema';
import { LeaveType, MyLeaveDocument } from 'src/schemas/category.leave.schema';
import { LeaveDocument, Leaves } from 'src/schemas/leave.schema';
import {
  Designation,
  DesignationDocument,
} from 'src/schemas/designation.schema';
import { Unique, UniqueDocument } from 'src/schemas/unique.schema';
import {
  NotificationDocument,
  Notification,
} from 'src/schemas/notification.schema';
import { ErrorLog } from 'src/helper/error.helper';

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
export class UserService {
  constructor(
    @InjectModel(Users.name) private UserModel: Model<UserDocument>,
    @InjectModel(Department.name)
    private DepartmentModel: Model<DepartmentDocument>,
    @InjectModel(Unique.name) private UniqueModel: Model<UniqueDocument>,
    @InjectModel(Roles.name) private RoleModel: Model<RoleDocument>,
    @InjectModel(UserLeave.name)
    private UserLeaveModel: Model<UserLeaveDocument>,
    @InjectModel(Leaves.name) private LeavesModel: Model<LeaveDocument>,
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    @InjectModel(Designation.name)
    private designationModel: Model<DesignationDocument>,
    @InjectModel(LeaveType.name) private MyLeaveModel: Model<MyLeaveDocument>,
    private readonly userLeaveService: UserLeaveService,
    private configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async sendEmail(CreateUserDto, token): Promise<any> {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: `${CreateUserDto.email}`,
      subject: `Welcome to Leave Management`,
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
                Hello ${CreateUserDto.first_name} ${CreateUserDto.last_name},
              </h3>
              <h3>Welcome to ${process.env.APP_NAME}</h3>

              <p>You have been added to the Leave Management , Kindly please find the below login id and password set up link to continue login.</p>
              <p><b>email:-</b></p>
             <p> ${CreateUserDto.email}</p><br>
              <p><b>To set password tap on the below link</b></p>
             <p>Set your password <b> <a href="${process.env.CLIENT_BASE_URL}?token=${token}" action=_blank>link</a></b></p>
             
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
      text: 'Someone applied for a leave',
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        ErrorLog(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    return 'Email sent';
  }
  async create(createUserDto: CreateUserDto) {
    try {
      // const reportingManagerCheck = await this.UserModel.findOne({
      //   _id: createUserDto.reporting_manager,
      // });
      const ifExist = await this.UserModel.findOne({
        email: createUserDto.email,
      });
      const departmentCheck = await this.DepartmentModel.findOne({
        _id: createUserDto.department_id,
      });
      const designationCheck = await this.designationModel.findOne({
        _id: createUserDto.designation,
        department: createUserDto.department_id,
      });
      // const roleCheck = await this.RoleModel.findOne({
      //   _id: createUserDto.user_role,
      // });

      if (ifExist) {
        return {
          status: false,
          statusCode: 400,
          message: 'User already exists with email.',
        };
      } else if (!departmentCheck) {
        return {
          status: false,
          statusCode: 400,
          message: 'Enter valid department.',
        };
      } else if (!designationCheck) {
        return {
          status: false,
          statusCode: 400,
          message: 'Enter valid designation.',
        };
      } else {
        let createdUser;

        if (createUserDto) {
          let randomPassword = '';
          const characters =
            'ZABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          const charactersLength = characters.length;
          for (let i = 0; i < 12; i++) {
            randomPassword += characters.charAt(
              Math.floor(Math.random() * charactersLength),
            );
          }
          createUserDto.password = randomPassword;
          // const nanoid = customAlphabet(
          //   '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
          //   6,
          // );
          // createUserDto.emp_id = await nanoid();
          const userCount1 = await this.UniqueModel.findOneAndUpdate(
            { uniqueId: 1 },
            { $inc: { unique: 1 } },
            { new: false },
          );
          const userCount = userCount1.unique;
          const str = process.env.APP_NAME;
          const acronym = str
            .split(/\s/)
            .reduce((response, word) => (response += word.slice(0, 1)), '');
          const unqCount = '' + userCount;
          const pad = '00000';
          const ans = pad.substring(0, pad.length - unqCount.length) + unqCount;
          const empId = acronym + ans;
          createUserDto.emp_id = empId;
          createUserDto.email = createUserDto.email.trim();
          // console.log(createUserDto,"createUserDto")
          try {
            createdUser = await this.UserModel.create(createUserDto);
            const payload = {
              id: createdUser._id,
              username: createdUser.email,
            };
            const token = this.jwtService.sign(payload, { expiresIn: '1h' });
            if (createdUser.email == createUserDto.email) {
              await this.sendEmail(createUserDto, token);
            }
            const userLeaveDto = {
              leave_type: createUserDto.leave_rules,
              user_id: createdUser._id,
            };
            // console.log(userLeaveDto, 'userLeaveDto');
            this.userLeaveService
              .createWithBalance(userLeaveDto)
              .then((err) => {
                console.log(err);
              });
          } catch (e) {
            console.log(e);
            return e;
          }
        }

        const successResponse = await createSuccessResponse(
          'User created successfully',
          createdUser,
          'USER_CREATE',
        );

        return successResponse;
      }
    } catch (error) {
      return {
        status: false,
        error: 'Something went wrong',
        message: error.message,
      };
    }
    //  let data = await this.UserModel.create(createUserDto);
    //   return data;
  }
  async createWithBalance(createUserDto: CreateUserDto) {
    try {
      // const reportingManagerCheck = await this.UserModel.findOne({
      //   _id: createUserDto.reporting_manager,
      // });
      const ifExist = await this.UserModel.findOne({
        email: createUserDto.email,
      });
      const departmentCheck = await this.DepartmentModel.findOne({
        _id: createUserDto.department_id,
      });
      const designationCheck = await this.designationModel.findOne({
        _id: createUserDto.designation,
        department: createUserDto.department_id,
      });
      // const roleCheck = await this.RoleModel.findOne({
      //   _id: createUserDto.user_role,
      // });

      if (ifExist) {
        return {
          status: false,
          statusCode: 400,
          message: 'User already exists with email.',
        };
      } else if (!departmentCheck) {
        return {
          status: false,
          statusCode: 400,
          message: 'Enter valid department.',
        };
      } else if (!designationCheck) {
        return {
          status: false,
          statusCode: 400,
          message: 'Enter valid designation.',
        };
      } else {
        let createdUser;

        if (createUserDto) {
          let randomPassword = '';
          const characters =
            'ZABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          const charactersLength = characters.length;
          for (let i = 0; i < 12; i++) {
            randomPassword += characters.charAt(
              Math.floor(Math.random() * charactersLength),
            );
          }
          createUserDto.password = randomPassword;
          // const nanoid = customAlphabet(
          //   '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
          //   6,
          // );
          // createUserDto.emp_id = await nanoid();
          const userCount1 = await this.UniqueModel.findOneAndUpdate(
            { uniqueId: 1 },
            { $inc: { unique: 1 } },
            { new: false },
          );
          const userCount = userCount1.unique;
          const str = process.env.APP_NAME;
          const acronym = str
            .split(/\s/)
            .reduce((response, word) => (response += word.slice(0, 1)), '');
          const unqCount = '' + userCount;
          const pad = '00000';
          const ans = pad.substring(0, pad.length - unqCount.length) + unqCount;
          const empId = acronym + ans;
          createUserDto.emp_id = empId;
          createUserDto.email = createUserDto.email.trim();
          const leaveRule = createUserDto.leave_rules;
          const userLeaveRule = [];
          for (let i = 0; i < leaveRule.length; i++) {
            userLeaveRule.push(leaveRule[i].id);
          }
          createUserDto.leave_rules = userLeaveRule;
          // console.log(createUserDto,"createUserDto")
          try {
            createdUser = await this.UserModel.create(createUserDto);
            const payload = {
              id: createdUser._id,
              username: createdUser.email,
            };
            const token = this.jwtService.sign(payload, { expiresIn: '1h' });
            if (createdUser.email == createUserDto.email) {
              await this.sendEmail(createUserDto, token);
            }
            const userLeaveDto = {
              leave_type: createUserDto.leave_rules,
              user_id: createdUser._id,
            };
            // console.log(userLeaveDto, 'userLeaveDto');
            this.userLeaveService
              .createWithBalance(userLeaveDto)
              .then((err) => {
                console.log(err);
              });
          } catch (e) {
            console.log(e);
            return e;
          }
        }

        const successResponse = await createSuccessResponse(
          'User created successfully',
          createdUser,
          'USER_CREATE',
        );

        return successResponse;
      }
    } catch (error) {
      return {
        status: false,
        error: 'Something went wrong',
        message: error.message,
      };
    }
    //  let data = await this.UserModel.create(createUserDto);
    //   return data;
  }
  async forgotPassword(body: any) {
    try {
      const email = body.email;
      const data = await this.UserModel.findOne({ email: email });
      if (data) {
        const payload = {
          username: email,
          _id: data._id,
        };
        const token = await this.jwtService.sign(payload);
        // console.log(token);

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: `${email}`,
          subject: `Forgot Password`,
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
                    Hello ${data.first_name} ${data.last_name},
                  </h3>
                  <p><b>Seems like you have requested for a new password, if this is correct please find the below link to reset your password.</b></p>
                  <p>Reset Password URL : <b> <a href="${process.env.CLIENT_BASE_URL}?token=${token}" action=_blank>click here to open</a></b></p>
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
          text: 'Someone applied for a leave',
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error, 'error');
          } else {
            console.log('Email sent: ' + info.response);
          }
        });

        return {
          status: true,
          message: 'Email sent',
        };
      } else {
        return {
          status: false,
          message: 'Email not found',
        };
      }
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        error: 'Something went wrong',
        message: error.message,
      };
    }
  }

  async resetPassword(body: any, token: any) {
    try {
      let decodeToken;
      try {
        decodeToken = await this.jwtService.verify(token);
        console.log(decodeToken, 'decodeToken');
      } catch (error) {
        return {
          status: false,
          statusCode: 500,
          error: 'Something went wrong',
          message: error.message,
        };
      }

      const data = await this.UserModel.findOne({
        email: decodeToken.username,
      });
      if (data) {
        // console.log(data, 'data');
        if (body.password == body.confirmPassword && body.password.length > 5) {
          const salt = bcrypt.genSaltSync(10);
          const hash = bcrypt.hashSync(body.password, salt);
          const updates = {
            password: hash,
          };
          const data2 = await this.UserModel.findOneAndUpdate(
            { email: decodeToken.username },
            updates,
            { new: true },
          );
          const successResponse = await createSuccessResponse(
            'Password changed successfully',
            data2,
            'USER_UPDATE',
          );
          return successResponse;
        } else {
          return {
            status: false,
            message:
              'Password and confirm password not matched or password length should be greater than 5 characters',
          };
        }
      } else {
        return {
          status: false,
          message: 'Email not found',
        };
      }
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        error: 'Something went wrong',
        message: error.message,
      };
    }
  }

  async adminSuperAdmin(query: any) {
    try {
      const data = await this.UserModel.find({})
        .populate('user_role')
        .select('_id first_name last_name  ');
      let reportingManager;
      if (query.role == 'employee') {
        reportingManager = data.filter(
          (item) =>
            item.user_role.role_name == 'admin' ||
            item.user_role.role_name == 'superAdmin',
        );
      } else {
        reportingManager = data.filter(
          (item) => item.user_role.role_name == 'superAdmin',
        );
      }
      // console.log(reportingManager, 'reportingManager');
      const successResponse = await createSuccessResponse(
        'Reporting manager list successfully',
        reportingManager,
        'USER_LIST',
      );
      return successResponse;
    } catch (error) {
      return {
        status: false,
        error: 'Something went wrong',
        message: error.message,
      };
    }
  }
  async findAll() {
    try {
      const allUser = [];
      const newJoin = [];
      let totalEmpolyee = {};
      const data = await this.UserModel.find().populate('department_id');
      totalEmpolyee = {
        totalEmpolyee: data.length,
      };

      allUser.push(data);
      allUser.push(totalEmpolyee);
      const today = new Date();
      const dd = today.getDate();
      const mm = today.getMonth() + 1;
      const yyyy = today.getFullYear();
      const currentDate = `${yyyy}/${mm}/${dd}`;
      const realDate = currentDate.split('/');

      data.forEach((user) => {
        if (user.join_date) {
          const dd1 = user.join_date.getDate();
          const mm1 = user.join_date.getMonth() + 1;
          const yyyy1 = user.join_date.getFullYear();
          const currentDate1 = `${yyyy1}/${mm1}/${dd1}`;

          const realDate1 = currentDate1.split('/');
          // console.log("inside", today)
          // console.log("inside", user.join_date)
          const dateOne = moment(realDate);
          const dateTwo = moment(realDate1);
          const result = dateOne.diff(dateTwo, 'days');
          // console.log("No of Days:", result)
          if (result < 180) {
            newJoin.push(user);
          }
        }
      });
      const newJoiner = {
        newJoin: newJoin,
      };
      allUser.push(newJoiner);
      // console.log(allUser)
      const successResponse = await createSuccessResponse(
        'Users fetched successfully',
        allUser,
        'USERS_FETCH',
      );

      return successResponse;
    } catch (error) {
      return {
        status: false,
        error: 'Something went wrong',
        message: error.message,
      };
    }
  }
  async importUsers(users: any) {
    try {
      // csv()
      //   .fromFile(users.path)
      //   .then((jsonObj) => {
      //     console.log(jsonObj);
      //   });
      const data = await csv().fromFile(users.path);
      const allUserData = [];
      console.log(data, 'data');

      for (let i = 0; i < data.length; i++) {
        const userCount1 = await this.UniqueModel.findOneAndUpdate(
          { uniqueId: 1 },
          { $inc: { unique: 1 } },
          { new: false },
        );
        const userCount = userCount1.unique;
        const str = process.env.APP_NAME;
        const acronym = str
          .split(/\s/)
          .reduce((response, word) => (response += word.slice(0, 1)), '');
        const unqCount = '' + userCount;
        const pad = '00000';
        const ans = pad.substring(0, pad.length - unqCount.length) + unqCount;
        const empId = acronym + ans;
        const leave_rules = data[i].leave_rules.split(',');
        const emailCheck = await this.UserModel.findOne({
          email: data[i].email,
        });
        const departmentCheck = await this.DepartmentModel.findOne({
          department_name: data[i].department,
        });
        if (!departmentCheck) {
          return {
            status: false,
            message: `Department ${data[i].department} not found`,
          };
        }

        const roleCheck = await this.RoleModel.findOne({
          role_name: data[i].user_role,
        });
        if (!roleCheck) {
          return {
            status: false,
            message: `${data[i].role} is not a valid role`,
          };
        }
        if (emailCheck) {
          return {
            status: false,
            message: `Email ${data[i].email} already exists`,
          };
        }
        const designationCheck = await this.designationModel.findOne({
          designation_name: data[i].designation,
        });
        if (!designationCheck) {
          return {
            status: false,
            message: `Designation ${data[i].designation} not found`,
          };
        }
        if (!departmentCheck._id.equals(designationCheck.department)) {
          return {
            status: false,
            message: `Designation ${data[i].designation} is not belongs to ${data[i].department}`,
          };
        }
        // const reportingManagerCheck = await this.UserModel.findOne({
        //   email: data[i].reporting_manager,
        // });
        // if (!reportingManagerCheck) {
        //   return {
        //     status: false,
        //     message: `Reporting manager ${data[i].reporting_manager} not found`,
        //   };
        // }
        const newLeaveRules = [];
        for (let k = 0; k < leave_rules.length; k++) {
          console.log(leave_rules[k], 'leave_rules[k]');
          const leaveRuleCheck = await this.MyLeaveModel.findOne({
            leave_type: leave_rules[k],
          });
          if (!leaveRuleCheck) {
            // break;
            return {
              status: 400,
              message: `Leave rule ${leave_rules[k]} not exists`,
            };
          } else {
            newLeaveRules.push(leaveRuleCheck._id);
          }
        }
        const user = {
          first_name: data[i].first_name,
          last_name: data[i].last_name,
          email: data[i].email,
          department_id: departmentCheck._id,
          designation: designationCheck._id,
          join_date: data[i].join_date,
          user_role: roleCheck._id,
          // reporting_manager: reportingManagerCheck._id,
          leave_rules: newLeaveRules,
          password: data[i].password || '123456',
          emp_id: empId,
        };
        allUserData.push(user);
      }
      // console.log(allUserData);
      for (let a = 0; a < allUserData.length; a++) {
        const userSave = await this.UserModel.create(allUserData[a]);
        if (!userSave) {
          return {
            status: false,
            message: 'Something went wrong',
          };
        } else {
          const payload = {
            id: userSave._id,
            username: userSave.email,
          };
          const token = this.jwtService.sign(payload, { expiresIn: '1h' });
          if (userSave.email == allUserData[a].email) {
            await this.sendEmail(allUserData[a], token);
          }
          const userLeaveDto = {
            leave_type: allUserData[a].leave_rules,
            user_id: userSave._id,
          };
          // console.log(userLeaveDto, 'userLeaveDto');
          this.userLeaveService.create(userLeaveDto).then((err) => {
            console.log(err);
          });
        }
      }

      // const data2 = await this.UserModel.insertMany(allUserData);

      // for(let j = 0; j < leave_rules.length; j++) {
      //   leave_rules[j] = leave_rules[j].trim();
      //   const leaveRule= await this.MyLeaveModel.findOne({leave_rule: leave_rules[j]});
      //   if(!leaveRule) {
      //     return{

      //     }
      // }
      //   const user1 = new this.UserModel({
      //     first_name: data[i].first_name,
      //     last_name: data[i].last_name,
      //     email: data[i].email,
      //     department_id: departmentCheck._id,
      //     designation: designationCheck._id,
      //     join_date: data[i].join_date,
      //     user_role: data[i].user_role,
      //     reporting_manager: reportingManagerCheck._id,
      //     leave_rules: newLeaveRules,
      //     password: data[i].password || '123456',
      //     emp_id: empId,
      //   });
      //   try {
      //     const createdUser = await user1.save();
      //     if (createdUser) {
      //       const payload = {
      //         id: createdUser._id,
      //         username: createdUser.email,
      //       };
      //       const token = this.jwtService.sign(payload, { expiresIn: '1h' });
      //       if (createdUser.email == data[i].email) {
      //         await this.sendEmail(data[i], token);
      //       }
      //       const userLeaveDto = {
      //         leave_type: leave_rules,
      //         user_id: createdUser._id,
      //       };
      //       // console.log(userLeaveDto, 'userLeaveDto');
      //       this.userLeaveService.create(userLeaveDto).then((err) => {
      //         console.log(err);
      //       });
      //     }
      //   } catch (error) {
      //     console.log(error);
      // ErrorLog(error);
      //     return {
      //       status: false,
      //       error: 'Something went wrong',
      //       message: error.message,
      //     };
      //   }
      // }
      const successResponse = await createSuccessResponse(
        'Users imported successfully',
        allUserData,
        'USERS_IMPORT',
      );
      return successResponse;
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return;
    }
  }
  async importUsersWithBalance(users: any) {
    try {
      // csv()
      //   .fromFile(users.path)
      //   .then((jsonObj) => {
      //     console.log(jsonObj);
      //   });
      const data = await csv().fromFile(users.path);
      const allUserData = [];
      const arrayToPassLeaveRule = [];
      console.log(data, 'data');

      for (let i = 0; i < data.length; i++) {
        const userCount1 = await this.UniqueModel.findOneAndUpdate(
          { uniqueId: 1 },
          { $inc: { unique: 1 } },
          { new: false },
        );
        const userCount = userCount1.unique;
        const str = process.env.APP_NAME;
        const acronym = str
          .split(/\s/)
          .reduce((response, word) => (response += word.slice(0, 1)), '');
        const unqCount = '' + userCount;
        const pad = '00000';
        const ans = pad.substring(0, pad.length - unqCount.length) + unqCount;
        const empId = acronym + ans;
        const leave_rules = data[i].leave_rules.split(',');
        const emailCheck = await this.UserModel.findOne({
          email: data[i].email,
        });
        const departmentCheck = await this.DepartmentModel.findOne({
          department_name: data[i].department,
        });
        if (!departmentCheck) {
          return {
            status: false,
            message: `Department ${data[i].department} not found`,
          };
        }

        const roleCheck = await this.RoleModel.findOne({
          role_name: data[i].user_role,
        });
        if (!roleCheck) {
          return {
            status: false,
            message: `${data[i].role} is not a valid role`,
          };
        }
        if (emailCheck) {
          return {
            status: false,
            message: `Email ${data[i].email} already exists`,
          };
        }
        const designationCheck = await this.designationModel.findOne({
          designation_name: data[i].designation,
        });
        if (!designationCheck) {
          return {
            status: false,
            message: `Designation ${data[i].designation} not found`,
          };
        }
        if (!departmentCheck._id.equals(designationCheck.department)) {
          return {
            status: false,
            message: `Designation ${data[i].designation} is not belongs to ${data[i].department}`,
          };
        }
        const reportingManagerCheck = await this.UserModel.findOne({
          email: data[i].reporting_manager,
        });
        if (!reportingManagerCheck) {
          return {
            status: false,
            message: `Reporting manager ${data[i].reporting_manager} not found`,
          };
        }
        const newLeaveRules = [];
        const arrayForLeaveRules = [];
        for (let k = 0; k < leave_rules.length; k++) {
          console.log(leave_rules[k], 'leave_rules[k]');
          let tempObj = {};
          let leaveRuleSplit = leave_rules[k].split(':');
          leaveRuleSplit = leaveRuleSplit.map((item) => item.trim());

          const leaveRuleCheck = await this.MyLeaveModel.findOne({
            leave_type: leaveRuleSplit[0],
          });
          if (!leaveRuleCheck) {
            // break;
            return {
              status: 400,
              message: `Leave rule ${leave_rules[k]} not exists`,
            };
          } else {
            newLeaveRules.push(leaveRuleCheck._id);
            tempObj = {
              id: leaveRuleCheck._id,
              leave_balance: parseInt(leaveRuleSplit[1]),
            };
            arrayForLeaveRules.push(tempObj);
          }
        }
        arrayToPassLeaveRule.push(arrayForLeaveRules);
        // console.log(arrayForLeaveRules, 'arrayForLeaveRules');
        const user = {
          first_name: data[i].first_name,
          last_name: data[i].last_name,
          email: data[i].email,
          department_id: departmentCheck._id,
          designation: designationCheck._id,
          join_date: data[i].join_date,
          user_role: roleCheck._id,
          reporting_manager: reportingManagerCheck._id,
          leave_rules: newLeaveRules,
          password: data[i].password || '123456',
          emp_id: empId,
        };
        allUserData.push(user);
      }
      // console.log(allUserData);
      for (let a = 0; a < allUserData.length; a++) {
        const userSave = await this.UserModel.create(allUserData[a]);
        if (!userSave) {
          return {
            status: false,
            message: 'Something went wrong',
          };
        } else {
          const payload = {
            id: userSave._id,
            username: userSave.email,
          };
          const token = this.jwtService.sign(payload, { expiresIn: '1h' });
          if (userSave.email == allUserData[a].email) {
            await this.sendEmail(allUserData[a], token);
          }
          const userLeaveDto = {
            leave_type: arrayToPassLeaveRule[a],
            user_id: userSave._id,
          };
          console.log(userLeaveDto, 'userLeaveDto');
          console.log(arrayToPassLeaveRule[a], 'userLeaveDto');
          this.userLeaveService.createWithBalance(userLeaveDto).then((err) => {
            console.log(err);
          });
        }
      }

      // const data2 = await this.UserModel.insertMany(allUserData);

      // for(let j = 0; j < leave_rules.length; j++) {
      //   leave_rules[j] = leave_rules[j].trim();
      //   const leaveRule= await this.MyLeaveModel.findOne({leave_rule: leave_rules[j]});
      //   if(!leaveRule) {
      //     return{

      //     }
      // }
      //   const user1 = new this.UserModel({
      //     first_name: data[i].first_name,
      //     last_name: data[i].last_name,
      //     email: data[i].email,
      //     department_id: departmentCheck._id,
      //     designation: designationCheck._id,
      //     join_date: data[i].join_date,
      //     user_role: data[i].user_role,
      //     reporting_manager: reportingManagerCheck._id,
      //     leave_rules: newLeaveRules,
      //     password: data[i].password || '123456',
      //     emp_id: empId,
      //   });
      //   try {
      //     const createdUser = await user1.save();
      //     if (createdUser) {
      //       const payload = {
      //         id: createdUser._id,
      //         username: createdUser.email,
      //       };
      //       const token = this.jwtService.sign(payload, { expiresIn: '1h' });
      //       if (createdUser.email == data[i].email) {
      //         await this.sendEmail(data[i], token);
      //       }
      //       const userLeaveDto = {
      //         leave_type: leave_rules,
      //         user_id: createdUser._id,
      //       };
      //       // console.log(userLeaveDto, 'userLeaveDto');
      //       this.userLeaveService.create(userLeaveDto).then((err) => {
      //         console.log(err);
      //       });
      //     }
      //   } catch (error) {
      //     console.log(error);
      // ErrorLog(error);
      //     return {
      //       status: false,
      //       error: 'Something went wrong',
      //       message: error.message,
      //     };
      //   }
      // }
      const successResponse = await createSuccessResponse(
        'Users imported successfully',
        allUserData,
        'USERS_IMPORT',
      );
      return successResponse;
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return;
    }
  }

  async findOne(id: string) {
    try {
      const data = await this.UserModel.findOne({ _id: id })
        .populate('leave_category')
        .populate({
          path: 'department_id',
          select: '_id department_name',
        })
        .populate({
          path: 'designation',
          select: 'designation_name',
        })
        .populate({
          path: 'reporting_manager',
          select:
            'first_name last_name department_id employee_type email avtar',
          populate: { path: 'department_id', select: 'department_name' },
        });
      const successResponse = await createSuccessResponse(
        'User fetched successfully',
        data,
        'USER_FETCH',
      );

      return successResponse;
    } catch (error) {
      return {
        status: false,
        error: 'Something went wrong',
        message: error.message,
      };
    }
  }
  async findById(id: string) {
    try {
      const data = await this.UserModel.findOne({ _id: id });

      return data;
    } catch (error) {
      return {
        status: false,
        error: 'Something went wrong',
        message: error.message,
      };
    }
  }
  async findEmail(email: string) {
    // try{

    const data = await this.UserModel.findOne({ email: email })
      .populate('user_role')
      .populate('department_id')
      .populate('reporting_manager');
    console.log(data, 'data');

    return data;
    // } catch (error) {
    //   return ({
    //     status: false,
    //     error:"Something went wrong",
    //     message:error.message,
    //   })
    // }
  }
  async downloadUserList(query: any) {
    try {
      const data = await this.UserModel.aggregate([
        {
          $match: {
            reporting_manager: query.id
              ? new mongoose.Types.ObjectId(query.id)
              : { $exists: true },
          },
        },
        {
          $lookup: {
            from: 'departments',
            localField: 'department_id',
            foreignField: '_id',
            as: 'department_id',
          },
        },
        {
          $unwind: {
            path: '$department_id',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'designations',
            localField: 'designation',
            foreignField: '_id',
            as: 'designation',
          },
        },
        { $unwind: { path: '$designation', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'roles',
            localField: 'user_role',
            foreignField: '_id',
            as: 'user_role',
          },
        },
        { $unwind: { path: '$user_role', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'leavetypes',
            let: { lid: '$leave_category' },
            pipeline: [
              { $match: { $expr: { $in: ['$_id', '$$lid'] } } },
              { $project: { leave_type: 1 } }, // suppress _id
            ],
            // localField: 'leave_category',
            // foreignField: '_id',
            as: 'leave_category',
          },
        },
        // {
        //   $unwind: {
        //     path: '$leave_category',
        //     preserveNullAndEmptyArrays: true,
        //   },
        // },
        {
          $lookup: {
            from: 'leave_rules',
            localField: 'leave_rules',
            foreignField: '_id',
            as: 'leave_rules',
          },
        },
        { $unwind: { path: '$leave_rules', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'users',
            localField: 'reporting_manager',
            foreignField: '_id',
            as: 'reporting_manager',
          },
        },
        {
          $unwind: {
            path: '$reporting_manager',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            first_name: 1,
            last_name: 1,
            email: 1,
            join_date: 1,
            designation: '$designation.designation_name',
            department: '$department_id.department_name',
            user_role: '$user_role.role_name',
            reporting_manager: '$reporting_manager.email',
            leave_rules: '$leave_category',
            panelty: 1,
            status: 1,
          },
        },
      ]);
      // console.log(data, 'data');
      const leaveRules = [];
      for (let i = 0; i < data.length; i++) {
        const { leave_rules, ...others } = data[i];
        const temp = [];
        for (let j = 0; j < leave_rules.length; j++) {
          temp.push(leave_rules[j].leave_type);
        }
        others.leave_rules = temp;
        others.join_date = moment(others.join_date).format('YYYY-MM-DD');
        // console.log(temp, 'temp');
        leaveRules.push(others);
        // leaveRules.push(data[i].leave_rules[j].leave_type);
      }
      // console.log(leaveRules, 'leaveRules');
      const filename = `${Date.now()}_user.csv`;
      const ws = await fs.createWriteStream(`./uploads/${filename}`);
      await fastcsv
        .write(leaveRules, {
          headers: [
            'first_name',
            'last_name',
            'email',
            'join_date',
            'designation',
            'department',
            'user_role',
            'reporting_manager',
            'leave_rules',
            'panelty',
            'status',
          ],
        })
        .on('finish', function () {
          // console.log('stream finished);
          // console.log(leaveRules, 'leaveRules');
          console.log('Write to fastcsv.csv successfully!');
        })
        .pipe(ws);
      return {
        status: true,
        // data,
        data: `${filename}`,
      };
    } catch (error) {
      return {
        status: false,
        error: 'Something went wrong',
        message: error.message,
      };
    }
  }
  async filterUserList(query: any) {
    try {
      const limit = query.limit || 10;
      const skip = query.skip || 0;

      // const array = [];
      // array.push(query.reporting_manager);
      const queryToPass = [];
      if (query) {
        queryToPass.push(
          {
            $match: {
              reporting_manager: query.reporting_manager
                ? new mongoose.Types.ObjectId(query.reporting_manager)
                : { $exists: true },
            },
          },
          {
            $lookup: {
              from: 'departments',
              localField: 'department_id',
              foreignField: '_id',
              as: 'department',
            },
          },
          {
            $unwind: {
              path: '$department',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'roles',
              localField: 'user_role',
              foreignField: '_id',
              as: 'user_role',
            },
          },
          {
            $unwind: {
              path: '$user_role',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'reporting_manager',
              foreignField: '_id',
              as: 'reporting_manager',
            },
          },
          {
            $unwind: {
              path: '$reporting_manager',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'designations',
              localField: 'designation',
              foreignField: '_id',
              as: 'designation',
            },
          },
          {
            $unwind: {
              path: '$designation',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 1,
              first_name: 1,
              last_name: 1,
              panelty: 1,
              email: 1,
              status: 1,
              department: {
                department_name: '$department.department_name',
              },
              avtar: 1,
              role: '$user_role.role_name',
              reporting_manager: {
                _id: '$reporting_manager._id',
                first_name: '$reporting_manager.first_name',
                last_name: '$reporting_manager.last_name',
                email: '$reporting_manager.email',
                avtar: '$reporting_manager.avtar',
              },
              designation: '$designation.designation_name',
              fullname: { $concat: ['$first_name', ' ', '$last_name'] },
              join_date: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
          {
            $sort: { createdAt: query.createdAt ? 1 : -1 },
          },
        );
      }

      if (query.status) {
        queryToPass.push({
          $match: {
            $or: [
              {
                status: query.status,
              },
            ],
          },
        });
      }

      if (query.keyword && query.keyword != '') {
        // console.log(query.keyword, 'query.keyword');
        queryToPass.push({
          $match: {
            fullname: { $regex: query.keyword, $options: 'i' },
          },
        });
      }
      if (query.first_name && query.first_name != '') {
        queryToPass.push({
          $sort: {
            first_name: query.first_name == 'desc' ? -1 : 1,
          },
        });
      }
      if (query.last_name && query.last_name != '') {
        queryToPass.push({
          $sort: {
            last_name: query.last_name == 'desc' ? -1 : 1,
          },
        });
      }
      if (query.email && query.email != '') {
        queryToPass.push({
          $sort: {
            email: query.email == 'desc' ? -1 : 1,
          },
        });
      }
      if (query.department && query.department != '') {
        queryToPass.push({
          $sort: {
            'department.department_name': query.department == 'desc' ? -1 : 1,
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

      const data = await this.UserModel.aggregate(queryToPass);

      const successResponse = await createSuccessResponse(
        'User fetched successfully',
        data,
        'USER_FETCH',
      );

      return successResponse;
    } catch (error) {
      return {
        status: false,
        error: 'Something went wrong',
        message: error.message,
      };
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      if (updateUserDto.department_id || updateUserDto.designation) {
        const departmentCheck = await this.DepartmentModel.findById(
          updateUserDto,
        );
        const designationCheck = await this.designationModel.findOne({
          _id: updateUserDto.designation,
          department: updateUserDto.department_id,
        });
        if (designationCheck) {
          updateUserDto.designation = designationCheck._id;
          updateUserDto.department_id = departmentCheck._id;
        }
      }
      const data = await this.UserModel.updateOne({ _id: id }, updateUserDto);
      const successResponse = await createSuccessResponse(
        'User updated successfully',
        data,
        'USER_UPDATE',
      );

      return successResponse;
    } catch (error) {
      return {
        status: false,
        error: 'Something went wrong',
        message: error.message,
      };
    }
  }

  async clearPanelty(id: string) {
    try {
      const data = await this.UserModel.updateOne(
        { _id: id },
        { $set: { panelty: 0 } },
      );
      const successResponse = await createSuccessResponse(
        'Penalty cleared successfully',
        data,
        'USER_PENALTY_CLEAR',
      );
      return successResponse;
    } catch (error) {
      return {
        status: false,
        error: 'Something went wrong',
        message: error.message,
      };
    }
  }
  async clearPaneltyOfMultipleUser(body: any) {
    try {
      for (let i = 0; i < body.users.length; i++) {
        await this.UserModel.updateOne(
          { _id: body.users[i] },
          { $set: { panelty: 0 } },
        );
      }
      const successResponse = await createSuccessResponse(
        'Penalty cleared successfully',
        [],
        'USER_PENALTY_CLEAR',
      );
      return successResponse;
    } catch (error) {
      return {
        status: false,
        error: 'Something went wrong',
        message: error.message,
      };
    }
  }
  async userActiveInactive(id: string, body: any) {
    try {
      const userData = await this.UserModel.findOne({ _id: id });
      if (userData) {
        let status = userData.status;
        if (status == 'active') {
          status = 'inactive';
        } else {
          status = 'active';
        }
        const data = await this.UserModel.updateOne(
          { _id: id },
          { $set: { status: body.status } },
          {
            new: true,
          },
        );
        const successResponse = await createSuccessResponse(
          'User updated successfully',
          data,
          'USER_UPDATE',
        );

        return successResponse;
      } else {
        return {
          status: false,
          error: 'Something went wrong',
          message: 'User not found',
        };
      }
    } catch (error) {
      return {
        status: false,
        error: 'Something went wrong',
        message: error.message,
      };
    }
  }
  async userUnderManager(id: string) {
    try {
      const data = await this.UserModel.find({ reporting_manager: id });
      const successResponse = await createSuccessResponse(
        'User updated successfully',
        data,
        'USER_UPDATE',
      );

      return successResponse;
    } catch (error) {
      return {
        status: false,
        error: 'Something went wrong',
        message: error.message,
      };
    }
  }

  async remove(id: string) {
    try {
      const data = await this.UserModel.find({
        reporting_manager: id,
      });
      const userData = await this.UserModel.findById(id).populate('user_role');
      console.log(userData, 'userData');
      console.log(userData.user_role.role_name, 'userData.user_role.role_name');
      const role = userData.user_role.role_name;
      if (role == 'superAdmin') {
        return {
          status: false,
          error: 'Something went wrong',
          message: 'You can not delete super admin',
        };
      } else {
        if (!(data.length > 0)) {
          const userData = this.UserModel.deleteOne({ _id: id });
          const leaveData = this.LeavesModel.deleteMany({ applied_by: id });
          const userLeaveData = this.UserLeaveModel.deleteMany({
            user_id: id,
          });
          Promise.all([userData, leaveData, userLeaveData]);
          const successResponse = await createSuccessResponse(
            'User remove successfully',
            {},
            'USER_REMOVE',
          );

          return successResponse;
        } else {
          return {
            status: false,
            error: 'Something went wrong',
            message: 'User is reporting manager',
          };
        }
      }
    } catch (error) {
      return {
        status: false,
        error: 'Something went wrong',
        message: error.message,
      };
    }
  }

  async assignLeaveType(id: string, assignLeaveDto: AssignLeaveUserDto) {
    try {
      assignLeaveDto.leave_category.forEach(async (item) => {
        await this.UserModel.findByIdAndUpdate(id, {
          $push: { leave_category: item },
        });
      });

      const data = await this.UserModel.findById(id).populate('leave_category');

      const successResponse = await createSuccessResponse(
        'leave type assign successfully',
        data,
        'LEAVE_TYPE_ADDED',
      );

      return successResponse;
    } catch (error) {
      return {
        status: false,
        error: 'Something went wrong',
        message: error.message,
      };
    }
  }

  async avtar(id, avtar) {
    try {
      console.log(id, avtar.filename);
      const avtarUrl = `${avtar.filename}`;
      const data = await this.UserModel.findByIdAndUpdate(
        id,
        { $set: { avtar: avtarUrl } },
        { new: true },
      );
      const successResponse = await createSuccessResponse(
        'Avtar updated successfully',
        data,
        'AVTAR_UPDATE',
      );

      return successResponse;
    } catch (error) {
      return {
        status: false,
        error: 'Something went wrong',
        message: error.message,
      };
    }
  }

  async removeLeaveType(id: string, assignLeaveDto: AssignLeaveUserDto) {
    try {
      assignLeaveDto.leave_category.forEach(async (item) => {
        await this.UserModel.findByIdAndUpdate(id, {
          $pull: { leave_category: item },
        });
      });

      const data = await this.UserModel.findById(id).populate('leave_category');
      const successResponse = await createSuccessResponse(
        'leave type removed successfully',
        data,
        'LEAVE_TYPE_REMOVED',
      );

      return successResponse;
    } catch (error) {
      return {
        status: false,
        error: 'Something went wrong',
        message: error.message,
      };
    }
  }
  async updatePersonalInfo(id: string, personalInfoDto: PersonalInfoDto) {
    try {
      // console.log(personalInfoDto, 'personalInfoDto');
      const first_name = personalInfoDto.first_name;
      const last_name = personalInfoDto.last_name;
      const updates = {};
      if (personalInfoDto.first_name) {
        updates['first_name'] = first_name;
      }
      if (personalInfoDto.last_name) {
        updates['last_name'] = last_name;
      }
      if (personalInfoDto.date_of_birth) {
        updates['date_of_birth'] = personalInfoDto.date_of_birth;
      }
      if (personalInfoDto.gender) {
        updates['gender'] = personalInfoDto.gender;
      }
      if (personalInfoDto.blood_group) {
        updates['blood_group'] = personalInfoDto.blood_group;
      }
      if (personalInfoDto.language) {
        updates['language'] = personalInfoDto.language;
      }
      if (personalInfoDto.marital_status) {
        updates['marital_status'] = personalInfoDto.marital_status;
      }
      if (personalInfoDto.home_address) {
        updates['home_address'] = personalInfoDto.home_address;
      }
      if (personalInfoDto.communication_address) {
        updates['communication_address'] =
          personalInfoDto.communication_address;
      }
      if (personalInfoDto.contact_number) {
        updates['contact_number'] = personalInfoDto.contact_number;
      }
      if (personalInfoDto.personal_email) {
        updates['personal_email'] = personalInfoDto.personal_email;
      }
      if (personalInfoDto.social_profiles) {
        updates['social_profiles'] = personalInfoDto.social_profiles;
      }
      if (personalInfoDto.facebook_url) {
        updates['facebook_url'] = personalInfoDto.facebook_url;
      }
      if (personalInfoDto.twitter_url) {
        updates['twitter_url'] = personalInfoDto.twitter_url;
      }
      if (personalInfoDto.linkedin_url) {
        updates['linkedin_url'] = personalInfoDto.linkedin_url;
      }

      const updateUser = await this.UserModel.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true },
      );
      const successResponse = await createSuccessResponse(
        'Personal Info Updated',
        updateUser,
        'PERSONAL_INFO_UPDATED',
      );

      return successResponse;
    } catch (error) {
      return {
        status: false,
        error: 'Something went wrong',
        message: error.message,
      };
    }
  }

  async updateWork(id: string, workDto: WorkDto) {
    try {
      // console.log(workDto, 'workDto');
      // Object.assign(workDto, { employeeId: id });
      const updates = {};
      if (workDto.probation_period) {
        updates['probation_period'] = workDto.probation_period;
      }
      if (workDto.location) {
        updates['location'] = workDto.location;
      }
      if (workDto.employee_type) {
        updates['employee_type'] = workDto.employee_type;
      }
      if (workDto.join_date) {
        updates['join_date'] = workDto.join_date;
      }
      if (workDto.status) {
        updates['status'] = workDto.status;
      }
      if (workDto.is_fresher) {
        updates['user_details'] = workDto.is_fresher;
      }
      if (workDto.designation) {
        updates['designation'] = workDto.designation;
      }
      if (workDto.job_title) {
        updates['job_title'] = workDto.job_title;
      }
      if (workDto.department) {
        updates['department_id'] = workDto.department;
      }

      const data = await this.UserModel.findByIdAndUpdate(
        { _id: id },
        { $set: updates },
        { new: true },
      );
      const successResponse = await createSuccessResponse(
        'Work Info Updated',
        data,
        'WORK_INFO_UPDATED',
      );

      return successResponse;
    } catch (error) {
      console.log(error, 'error');
      return {
        status: false,
        error: 'Something went wrong',
        message: error.message,
      };
    }
  }

  async addSuperAdmin(body: any) {
    try {
      if (body.admin === 'botrv' && body.adminPass === 'botrv1209') {
        const user = await this.UserModel.findOne({ email: body.email });
        if (user) {
          return {
            status: false,
            error: 'User already exists',
            message: 'User already exists',
          };
        }
        const salt = await bcrypt.genSalt(10);
        body.password = await bcrypt.hash(body.password, salt);
        body.user_role = '624abed13c3eb9ee78f25a6b';
        // body.designation = '62ac29eb27849ec05f4b53e7';
        body.join_date = new Date();
        // body.department_id = '62565bc0fbad4f7c7bcd0f04';
        // body.emp_id = 'lytdssgsd';
        let userCount = await this.UserModel.countDocuments();
        userCount = userCount + 1;
        const str = process.env.APP_NAME;
        const acronym = str
          .split(/\s/)
          .reduce((response, word) => (response += word.slice(0, 1)), '');
        const unqCount = '' + userCount;
        const pad = '00000';
        const ans = pad.substring(0, pad.length - unqCount.length) + unqCount;
        const empId = acronym + ans;
        body.emp_id = empId;
        const newUser = new this.UserModel(body);
        const userData = await newUser.save();
        const successResponse = await createSuccessResponse(
          'User Created',
          userData,
          'USER_CREATED',
        );
        return successResponse;
      } else {
        return {
          status: false,
          error: 'Invalid Credentials',
          message: 'Invalid Credentials',
        };
      }
    } catch (error) {
      return {
        status: false,
        error: 'Something went wrong',
        message: error.message,
      };
    }
  }
  async probationPeriod() {
    const data = await this.UserModel.find({});
    for (let i = 0; i < data.length; i++) {
      const user = data[i];
      const joinDate = user.join_date;
      const today = new Date();
      const diff = today.getTime() - joinDate.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      console.log(days, 'days');
      if (days == 180) {
        // const notificationData = {
        //   message: `${user.first_name} ${user.last_name}'s probation period is over`,
        //   user_id: user.reporting_manager,
        //   // link: .avtar,
        //   action_by: user._id,
        // };
        // const notification = await this.notificationModel.create(
        //   notificationData,
        // );

        const allUser = await this.UserModel.find().populate('user_role');

        const admin = await allUser.filter((admin) => {
          if (admin.user_role) {
            if (admin.user_role.role_name == 'superAdmin') {
              return admin;
            }
          }
        });
        admin.forEach(async (admin) => {
          console.log(admin.email, 'admin.email');
          const notificationData = {
            message: `${user.first_name} ${user.last_name}'s probation period is over`,
            user_id: admin._id,
            // link: .avtar,
            action_by: user._id,
          };
          await this.notificationModel.create(notificationData);

          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: `${admin.email}`,
            // cc: `${reportingManagerData.email}`,
            subject: `Probation period is over`,
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
                      Hello ${admin.first_name} ${admin.last_name},
                    </h3>
                    <p>${user.first_name} ${user.last_name}'s probation period is over</p>
                    <p>Please re-assign new leave rules .</p>
                    
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
            text: 'Someone applied for a leave',
          };
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
              ErrorLog(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        });
      }
    }
  }
}
