import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument, Users } from 'src/schemas/user.schema';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Users.name) private UserModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  // async forgotPassword(body: any) {
  //   try {
  //     const email = body.email;
  //     const data = await this.UserModel.findOne({ email: email });
  //     if (data) {
  //       const payload = {
  //         email: email,
  //         _id: data._id,
  //       };
  //       const token = await this.jwtService.sign(payload);
  //       console.log(token);

  //       const mailOptions = {
  //         from: process.env.EMAIL_USER,
  //         to: `${email}`,
  //         subject: 'Forgot password',
  //         html: `<h1>To chanage password click on the link</h1> &nbsp; &nbsp;&nbsp; <h4>Reset password <a href="${process.env.CLIENT_BASE_URL}/${token} action="_blank">link</a></h4>`,
  //       };
  //       transporter.sendMail(mailOptions, function (error, info) {
  //         if (error) {
  //           console.log(error, 'error');
  //         } else {
  //           console.log('Email sent: ' + info.response);
  //         }
  //       });

  //       return {
  //         status: true,
  //         message: 'Email sent',
  //       };
  //     } else {
  //       return {
  //         status: false,
  //         message: 'Email not found',
  //       };
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     return {
  //       status: false,
  //       error: 'Something went wrong',
  //       message: error.message,
  //     };
  //   }
  // }

  // async resetPassword(body: any, token: any) {
  //   try {
  //     let decodeToken;
  //     try {
  //       decodeToken = await this.jwtService.verify(token);
  //     } catch (error) {
  //       return {
  //         status: false,
  //         statusCode: 500,
  //         error: 'Something went wrong',
  //         message: error.message,
  //       };
  //     }
  //     const data = await this.UserModel.findOne({ email: decodeToken.email });
  //     if (data) {
  //       if (body.password == body.confirmPassword) {
  //         const updates = {
  //           password: body.password,
  //         };
  //         const data = await this.UserModel.findOneAndUpdate(
  //           { email: decodeToken.email },
  //           updates,
  //           { new: true },
  //         );
  //         const successResponse = await createSuccessResponse(
  //           'Password changed successfully',
  //           data,
  //           'USER_UPDATE',
  //         );
  //         return successResponse;
  //       } else {
  //         return {
  //           status: false,
  //           message: 'Password and confirm password not matched',
  //         };
  //       }
  //     } else {
  //       return {
  //         status: false,
  //         message: 'Email not found',
  //       };
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     return {
  //       status: false,
  //       error: 'Something went wrong',
  //       message: error.message,
  //     };
  //   }
  // }
}
