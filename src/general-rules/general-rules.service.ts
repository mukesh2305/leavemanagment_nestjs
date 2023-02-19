import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { GeneralRuleDocument } from 'src/schemas/general.rules.schema';
import { CreateGeneralRuleDto } from './dto/create-general-rule.dto';
import { UpdateGeneralRuleDto } from './dto/update-general-rule.dto';
import { Model } from 'mongoose';
import { createSuccessResponse } from 'src/helper/success.helper';
import { ErrorLog } from 'src/helper/error.helper';

@Injectable()
export class GeneralRulesService {
  constructor(
    @InjectModel('GeneralRule')
    private readonly generalRuleModel: Model<GeneralRuleDocument>,
  ) {}

  async create(createGeneralRuleDto: CreateGeneralRuleDto) {
    try {
      const generalRule = await this.generalRuleModel.create(
        createGeneralRuleDto,
      );
      const successResponse = await createSuccessResponse(
        'GeneralRule',
        generalRule,
        'GENERAL_RULE_CREATED',
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
      const limit = query.limit || 5;
      const skip = query.skip || 0;
      const length = await this.generalRuleModel
        .find(
          query.keyword
            ? { rule_name: { $regex: query.keyword, $options: 'i' } }
            : {},
        )
        .count();
      const data = await this.generalRuleModel
        .find(
          query.keyword
            ? { rule_name: { $regex: query.keyword, $options: 'i' } }
            : {},
        )
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .sort({ createdAt: query.createdAt ? 1 : -1 });
      const response = {
        totalGeneralRules: length,
        data: data,
      };
      const successResponse = await createSuccessResponse(
        'GeneralRules',
        response,
        'GENERAL_RULES_FETCHED',
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

  // findOne(id: number) {
  //   return `This action returns a #${id} generalRule`;
  // }

  async update(id: string, updateGeneralRuleDto: UpdateGeneralRuleDto) {
    try {
      const generalRule = await this.generalRuleModel.findByIdAndUpdate(
        id,
        updateGeneralRuleDto,
        { new: true },
      );
      const successResponse = await createSuccessResponse(
        'GeneralRule',
        generalRule,
        'GENERAL_RULE_UPDATED',
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
      const generalRule = await this.generalRuleModel.findByIdAndRemove(id);
      const successResponse = await createSuccessResponse(
        'GeneralRule',
        generalRule,
        'GENERAL_RULE_REMOVED',
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
