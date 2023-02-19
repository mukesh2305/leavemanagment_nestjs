import { Injectable } from '@nestjs/common';
import { Issues, IssuesDocument } from 'src/schemas/issues.schema';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorLog } from 'src/helper/error.helper';
import { createSuccessResponse } from 'src/helper/success.helper';
import { Ticket, TicketDocument } from 'src/schemas/ticket.schema';

@Injectable()
export class IssuesService {
  constructor(
    @InjectModel(Issues.name)
    private readonly issueModel: Model<IssuesDocument>,
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<TicketDocument>,
  ) {}

  async create(createIssueDto: CreateIssueDto) {
    try {
      const createIssue = await this.issueModel.create(createIssueDto);
      const successResponse = await createSuccessResponse(
        'Issue created successfully',
        createIssue,
        'ISSUE_CREATED',
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
      const data = await this.issueModel
        .find({
          title: { $regex: query.keyword, $options: 'i' },
        })
        .sort({ issue: 1 });
      const successResponse = await createSuccessResponse(
        'Projects fetched successfully',
        data,
        'PROJECTS_FETCHED',
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

  async findAllFilter(query: any) {
    try {
      const limit = query.limit || 10;
      const skip = query.skip || 0;
      const queryToPass = [];
      if (query) {
        queryToPass.push(
          {
            $match: {
              _id: { $exists: true },
            },
          },
          { $sort: { createdAt: query.createdAt ? 1 : -1 } },
        );
      }
      if (query.keyword && query.keyword !== '') {
        queryToPass.push({
          $match: {
            issue: { $regex: query.keyword, $options: 'i' },
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
      const data = await this.issueModel.aggregate(queryToPass);
      const successResponse = await createSuccessResponse(
        'Projects fetched successfully',
        data,
        'PROJECTS_FETCHED',
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

  async update(id: string, updateIssueDto: UpdateIssueDto) {
    try {
      const updateIssue = await this.issueModel.findByIdAndUpdate(
        id,
        updateIssueDto,
        { new: true },
      );
      const successResponse = createSuccessResponse(
        'Issue updated successfully',
        updateIssue,
        'ISSUE_UPDATED',
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
      const checkIssue = await this.ticketModel.find({ issue: id });
      if (checkIssue) {
        return {
          success: false,
          message: 'issue is used in tickets',
        };
      } else {
        const removeIssue = await this.issueModel.findByIdAndRemove(id);
        const successResponse = createSuccessResponse(
          'Issue removed successfully',
          removeIssue,
          'ISSUE_REMOVED',
        );
        return successResponse;
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
