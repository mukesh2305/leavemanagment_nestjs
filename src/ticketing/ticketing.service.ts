import { Injectable } from '@nestjs/common';
import { Ticket, TicketDocument } from 'src/schemas/ticket.schema';
import { CreateTicketingDto } from './dto/create-ticketing.dto';
import { UpdateTicketingDto } from './dto/update-ticketing.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ErrorLog } from 'src/helper/error.helper';
import { createSuccessResponse } from 'src/helper/success.helper';
import mongoose from 'mongoose';
import ShortUniqueId from 'short-unique-id';
import { UserDocument, Users } from 'src/schemas/user.schema';
import { sendMail } from 'src/helper/mail.helper';

@Injectable()
export class TicketingService {
  constructor(
    @InjectModel(Ticket.name)
    private readonly ticketingModel: Model<TicketDocument>,
    @InjectModel(Users.name)
    private readonly usersModel: Model<UserDocument>,
  ) {}

  async create(createTicketingDto: CreateTicketingDto) {
    try {
      const uid = await new ShortUniqueId({ length: 10 });
      console.log(uid());
      createTicketingDto['track_id'] = uid();
      const createTicketing = await this.ticketingModel.create(
        createTicketingDto,
      );
      const user = await this.usersModel.findById(createTicketingDto.user_id);
      const allUser = await this.usersModel.find().populate('user_role');
      const admin = await allUser.filter((user) => {
        if (user.user_role) {
          if (user.user_role.role_name == 'superAdmin') {
            return user;
          }
        }
      });
      let emailOfSuperAdmin = '';
      admin.forEach((user) => {
        emailOfSuperAdmin += `${user.email},`;
      });
      const to = emailOfSuperAdmin;
      const subject = 'New Ticket Created';
      const nameOf = `admin`;
      const body = `<p>${user.first_name} ${user.last_name} has created a new ticket</p>
      <p>Ticket Id: ${createTicketing.track_id}</p>
      <p>Ticket Issue: ${createTicketing.issue}</p>
      <p>Ticket Message: ${createTicketing.message}</p>
      `;
      await sendMail(to, subject, nameOf, body);

      const successResponse = await createSuccessResponse(
        'Ticketing created successfully',
        createTicketing,
        'TICKETING_CREATED',
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

  async findAll(query: any) {
    try {
      const limit = query.limit || 10;
      const skip = query.skip || 0;
      const queryToPass = [];
      queryToPass.push(
        {
          $match: {
            user_id: new mongoose.Types.ObjectId(query.user_id),
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
            from: 'issues',
            localField: 'issue',
            foreignField: '_id',
            as: 'issue',
          },
        },
        {
          $unwind: {
            path: '$issue',
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
            issue: '$issue.issue',
            documents: 1,
            start_date: 1,
            end_date: 1,
            track_id: 1,
            status: 1,
            date: 1,
            message: 1,
            comment: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      );

      if (query.status) {
        queryToPass.push({
          $match: {
            status: query.status,
          },
        });
      }
      if (query.keyword && query.keyword != '') {
        queryToPass.push({
          $match: {
            $or: [
              {
                full_name: {
                  $regex: query.keyword,
                  $options: 'i',
                },
              },
              {
                issue: {
                  $regex: query.keyword,
                  $options: 'i',
                },
              },
            ],
          },
        });
      }
      if (query.track_id) {
        queryToPass.push({
          $match: {
            track_id: query.track_id,
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
      const result = await this.ticketingModel.aggregate(queryToPass);
      const successResponse = await createSuccessResponse(
        'ticket fetched',
        result,
        'TICKET_FETCHED',
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

  async findAllTickets(query: any) {
    try {
      const limit = query.limit || 10;
      const skip = query.skip || 0;
      const queryToPass = [];
      queryToPass.push(
        {
          $match: {
            user_id: { $exists: true },
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
            from: 'issues',
            localField: 'issue',
            foreignField: '_id',
            as: 'issue',
          },
        },
        {
          $unwind: {
            path: '$issue',
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
            issue: '$issue.issue',
            documents: 1,
            start_date: 1,
            end_date: 1,
            track_id: 1,
            status: 1,
            date: 1,
            message: 1,
            comment: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      );

      if (query.status) {
        queryToPass.push({
          $match: {
            status: query.status,
          },
        });
      }
      if (query.keyword && query.keyword != '') {
        queryToPass.push({
          $match: {
            $or: [
              {
                full_name: {
                  $regex: query.keyword,
                  $options: 'i',
                },
              },
              {
                issue: {
                  $regex: query.keyword,
                  $options: 'i',
                },
              },
            ],
          },
        });
      }
      if (query.track_id) {
        queryToPass.push({
          $match: {
            track_id: query.track_id,
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
      const result = await this.ticketingModel.aggregate(queryToPass);
      const successResponse = await createSuccessResponse(
        'ticket fetched',
        result,
        'TICKET_FETCHED',
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
  async findAllTicketsRm(id: string, query: any) {
    try {
      const userIds = await this.usersModel
        .find({ reporting_manager: id })
        .select('_id');
      const userIdsArray = [];
      userIds.forEach((element) => {
        userIdsArray.push(new mongoose.Types.ObjectId(element._id));
      }),
        console.log(userIds);
      const limit = query.limit || 10;
      const skip = query.skip || 0;
      const queryToPass = [];

      queryToPass.push(
        {
          $match: {
            user_id: { $in: userIdsArray },
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
            from: 'issue',
            localField: 'issue',
            foreignField: '_id',
            as: 'issue',
          },
        },
        {
          $unwind: {
            path: '$issue',
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
            issue: '$issue.issue',
            documents: 1,
            start_date: 1,
            end_date: 1,
            track_id: 1,
            status: 1,
            message: 1,
            comment: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      );

      if (query.status) {
        queryToPass.push({
          $match: {
            status: query.status,
          },
        });
      }
      if (query.keyword && query.keyword != '') {
        queryToPass.push({
          $match: {
            $or: [
              {
                full_name: {
                  $regex: query.keyword,
                  $options: 'i',
                },
              },
              {
                issue: {
                  $regex: query.keyword,
                  $options: 'i',
                },
              },
            ],
          },
        });
      }
      if (query.track_id) {
        queryToPass.push({
          $match: {
            track_id: query.track_id,
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
      const result = await this.ticketingModel.aggregate(queryToPass);
      const successResponse = await createSuccessResponse(
        'ticket fetched',
        result,
        'TICKET_FETCHED',
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
    return `This action returns a #${id} ticketing`;
  }

  async update(
    id: string,
    updateTicketingDto: UpdateTicketingDto,
    documents: any,
  ) {
    try {
      let updateTicketing;
      if (updateTicketingDto.status == 'closed') {
        updateTicketingDto['documents'] = documents.map((item) => {
          return item.filename;
        });
        updateTicketing = await this.ticketingModel.findByIdAndUpdate(
          id,
          updateTicketingDto,
          { new: true },
        );
        const userData = await this.usersModel.findById(
          updateTicketing.user_id,
        );
        const ticketData = await this.ticketingModel
          .findById(id)
          .populate('issue');
        const to = userData.email;
        const subject = 'Ticket Closed';
        const user = `${userData.first_name} ${userData.last_name}`;
        const body = `<p>Your ticket has been closed by admin. </p>
        <p>Track Id:${updateTicketing.track_id}</p>
        <p>Issue:${ticketData.issue.issue}</p>
        <p>Message:${updateTicketing.message}</p>
        <p>Comment:${
          updateTicketing.comment ? updateTicketing.comment : '--'
        }</p>
        ${
          updateTicketing.documents.length > 0
            ? `<p>Download your document from your ticket section`
            : ''
        }
        <br>
        <p>Please contact admin for further details.</p>
        `;
        await sendMail(to, subject, user, body);
      } else {
        updateTicketing = await this.ticketingModel.findByIdAndUpdate(
          id,
          updateTicketingDto,
          { new: true },
        );
      }
      const successResponse = await createSuccessResponse(
        'Ticketing updated successfully',
        updateTicketing,
        'TICKETING_UPDATED',
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

  async remove(id: string) {
    try {
      const ticketCheck = await this.ticketingModel.findById(id);
      if (ticketCheck.status == 'open') {
        await this.ticketingModel.findByIdAndRemove(id);
        const successResponse = createSuccessResponse(
          'Ticketing removed successfully',
          '',
          'TICKETING_REMOVED',
        );
        return successResponse;
      } else {
        return {
          status: false,
          message: 'ticket is closed or in progress',
          error: '',
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
}
