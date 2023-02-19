import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import { UpdateContactUsDto } from './dto/update-contact-us.dto';
import { ContactUs } from './entities/contact-us.entity';
import { Model } from 'mongoose';
import { createSuccessResponse } from 'src/helper/success.helper';
import * as nodemailer from 'nodemailer';
import 'dotenv/config';
import { UserDocument, Users } from 'src/schemas/user.schema';
import { FilterContactUsDto } from './dto/filter-contact-us.dto';
import * as fastcsv from 'fast-csv';
import * as fs from 'fs';
import * as moment from 'moment';
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
export class ContactUsService {
  constructor(
    @InjectModel('ContactUs') private readonly contactUsModel: Model<ContactUs>,
    @InjectModel(Users.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createContactUsDto: CreateContactUsDto) {
    try {
      const userCheck = await this.userModel.findById(
        createContactUsDto.user_id,
      );
      if (userCheck) {
        const contactUs = await this.contactUsModel.create(createContactUsDto);
        const successResponse = await createSuccessResponse(
          'contactUs created successfully',
          contactUs,
          'Form submitted successfully',
        );
        const users = await this.userModel.find().populate('user_role');
        const admin = await users.filter((user) => {
          if (user.user_role) {
            if (user.user_role.role_name == 'superAdmin') {
              return user;
            }
          }
        });
        admin.forEach((user) => {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: `${user.email}`,
            subject: `Contact Us Form`,
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
                      Hello ${user.first_name} ${user.last_name},
                    </h3>
                    <p>New Contact Us Form</p>
                    <p>name: ${userCheck.first_name} ${userCheck.last_name}</p>
                    <p>email: ${userCheck.email}</p>
                    <p>subject: ${createContactUsDto.subject}</p>
                    <p>contact number: ${createContactUsDto.contact_number}</p>
                    <p>description: ${createContactUsDto.message}</p>
                  </div>
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

  async findAll(query: any) {
    try {
      const limit = query.limit || 5;
      const skip = query.skip || 0;
      const queryToPass = [];
      if (query) {
        queryToPass.push(
          {
            $match: {
              _id: { $exists: true },
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
            $project: {
              _id: 1,
              name: { $concat: ['$user.first_name', ' ', '$user.last_name'] },
              email: '$user.email',
              avtar: '$user.avtar',
              subject: 1,
              contact_number: 1,
              message: 1,
              createdAt: 1,
            },
          },
          {
            $sort: {
              createdAt: query.createdAt ? 1 : -1,
            },
          },
        );
      }
      if (query.name) {
        queryToPass.push({
          $match: {
            $or: [
              {
                name: {
                  $regex: query.name,
                  $options: 'i',
                },
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
      const contactUs = await this.contactUsModel.aggregate(queryToPass);
      const successResponse = await createSuccessResponse(
        'contactUs found successfully',
        contactUs,
        'Form submitted successfully',
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

  async downloadContactUs() {
    try {
      const data = await this.contactUsModel.aggregate([
        {
          $match: {
            _id: { $exists: true },
          },
        },
      ]);
      if (data) {
        const filename = `ContactUs_${moment(Date()).format(
          'YYYY_MM_DD_HH_mm_ss',
        )}.csv`;
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
          'no data found',
          {},
          'NO_DATA_FOUND',
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

  //   update(id: number, updateContactUsDto: UpdateContactUsDto) {
  //     return `This action updates a #${id} contactUs`;
  //   }

  async remove(id: string) {
    try {
      const contactUs = await this.contactUsModel.findByIdAndDelete(id);
      const successResponse = await createSuccessResponse(
        'contactUs deleted successfully',
        contactUs,
        'Form submitted successfully',
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
