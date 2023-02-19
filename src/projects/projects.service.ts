import { Injectable } from '@nestjs/common';
import { ProjectDocument } from 'src/schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { createSuccessResponse } from 'src/helper/success.helper';
import { ErrorLog } from 'src/helper/error.helper';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private ProjectModel: Model<ProjectDocument>,
  ) {}

  async create(createProjectDto: CreateProjectDto) {
    try {
      const data = await this.ProjectModel.create(createProjectDto);
      const successResponse = await createSuccessResponse(
        'Project created successfully',
        data,
        'PROJECT_CREATED',
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
      const data = await this.ProjectModel.find({
        title: { $regex: query.keyword, $options: 'i' },
      }).sort({ title: 1 });
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
            title: { $regex: query.keyword, $options: 'i' },
          },
        });
      }
      if (query.status && query.status !== '') {
        queryToPass.push({
          $match: {
            status: query.status,
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
      const data = await this.ProjectModel.aggregate(queryToPass);
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

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    try {
      const data = await this.ProjectModel.findByIdAndUpdate(
        id,
        updateProjectDto,
        {
          new: true,
        },
      );
      const successResponse = await createSuccessResponse(
        'Project updated successfully',
        data,
        'PROJECT_UPDATED',
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
      const data = await this.ProjectModel.findByIdAndRemove(id);
      const successResponse = await createSuccessResponse(
        'Project deleted successfully',
        data,
        'PROJECT_DELETED',
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
}
