import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, Users } from '../schemas/user.schema';
import { Seeder, DataFactory } from 'nestjs-seeder';
import { Unique, UniqueDocument } from 'src/schemas/unique.schema';
import { sendMail } from 'src/helper/mail.helper';
import { JwtService } from '@nestjs/jwt';
import { Roles, RoleDocument } from 'src/schemas/role.schema';
import * as bcrypt from 'bcryptjs';
import { Project, ProjectDocument } from 'src/schemas/project.schema';
import { LeaveType, MyLeaveDocument } from 'src/schemas/category.leave.schema';

@Injectable()
export class UniqueSeeder implements Seeder {
  constructor(
    @InjectModel(Unique.name) private readonly unique: Model<UniqueDocument>,
    @InjectModel(Roles.name) private RoleModel: Model<RoleDocument>,
  ) {}

  async drop(): Promise<any> {
    this.RoleModel.deleteMany({});
    return this.unique.deleteMany({});
  }
  async seed(): Promise<any> {
    const uni = await this.unique.create({
      unique: 1,
    });
    // console.log('!!!!1111111111111111111111');
    // return this.unique.find();
    const roleData = [
      {
        role_name: 'employee',
        role_description: 'employee role',
      },
      {
        role_name: 'admin',
        role_description: 'admin role',
      },
      {
        role_name: 'superAdmin',
        role_description: 'super admin role',
      },
    ];
    return this.RoleModel.insertMany(roleData);
  }
}
export class UsersSeeder implements Seeder {
  constructor(
    @InjectModel(Users.name) private readonly user: Model<UserDocument>,
    @InjectModel(Unique.name) private readonly unique: Model<UniqueDocument>,
    @InjectModel(Roles.name) private RoleModel: Model<RoleDocument>,
    @InjectModel(Project.name) private ProjectModel: Model<ProjectDocument>,
    @InjectModel(LeaveType.name) private MyLeaveModel: Model<MyLeaveDocument>,

    private readonly jwtService: JwtService,
  ) {}

  async drop(): Promise<any> {
    return this.user.deleteMany({});
  }
  async seed(): Promise<any> {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(process.env.SUPER_ADMIN_PASSWORD, salt);

    const data = {
      first_name: 'super',
      last_name: 'admin',
      email: process.env.SUPER_ADMIN_EMAIL,
      password: hash,
      join_date: new Date(),
    };
    // console.log('222222222222222222222');
    const userCount1 = await this.unique.findOneAndUpdate(
      { uniqueId: 1 },
      { $inc: { unique: 1 } },
      { new: false },
    );

    // console.log(userCount1, 'value new');
    const userCount = userCount1.unique;
    const str = process.env.APP_NAME;
    const acronym = str
      .split(/\s/)
      .reduce((response, word) => (response += word.slice(0, 1)), '');
    const unqCount = '' + userCount;
    const pad = '00000';
    const ans = pad.substring(0, pad.length - unqCount.length) + unqCount;
    const empId = acronym + ans;
    data['emp_id'] = empId;

    //role
    const roles = await this.RoleModel.findOne({ role_name: 'superAdmin' });
    data['user_role'] = roles._id;
    // console.log(data, 'data');
    const createdUser = await this.user.create(data);
    // console.log(createdUser, 'createdYser');
    // const payload = {
    //   id: createdUser._id,
    //   username: createdUser.email,
    // };
    // const token = this.jwtService.sign(payload, { expiresIn: '1h' });
    // if (createdUser.email == data.email) {
    //   // console.log('inside if');
    //   const to = createdUser.email;
    //   const subject = 'Welcome to Leave Management';
    //   const user = `${createdUser.first_name} ${createdUser.last_name}`;
    //   const body = `<h3>Welcome to ${process.env.APP_NAME}</h3>

    //   <p>You have been added to the Leave Management , Kindly please find the below login id and password set up link to continue login.</p>
    //   <p><b>email:-</b></p>
    //  <p> ${createdUser.email}</p><br>
    //   <p><b>To set password tap on the below link</b></p>
    //  <p>Set your password <b> <a href="${process.env.CLIENT_BASE_URL}?token=${token}" action=_blank>link</a></b></p>
    //  `;
    //   const mailData = await sendMail(to, subject, user, body);
    //   // console.log(mailData, 'maildata');
    // }
    const data2 = await this.ProjectModel.create({
      title: 'dedicated',
      description: 'work in dedicated project',
    });
    await this.MyLeaveModel.create({
      leave_type: 'loss-of-pay',
      leave_balance: 10,
      leave_description: ' loss of pay leave',
    });
    // console.log(data2, 'data');

    return;
  }
}
