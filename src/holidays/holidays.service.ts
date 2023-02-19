import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createSuccessResponse } from 'src/helper/success.helper';
import { HolidayDocument, Holidays } from 'src/schemas/holiday.schema';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import * as fastcsv from 'fast-csv';
import * as fs from 'fs';
import { ErrorLog } from 'src/helper/error.helper';
import * as moment from 'moment';

@Injectable()
export class HolidaysService {
  constructor(
    @InjectModel(Holidays.name) private HolidaysModel: Model<HolidayDocument>,
  ) {}

  async create(createHolidayDto: CreateHolidayDto): Promise<any> {
    try {
      const weekday = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];

      const d = new Date(createHolidayDto.holiday_date);
      const day = weekday[d.getDay()];
      const holidayCheck = await this.HolidaysModel.find({
        holiday_date: moment(createHolidayDto.holiday_date).format(
          'YYYY-MM-DD',
        ),
      });
      if (holidayCheck) {
        createHolidayDto.holiday_day = day;
        createHolidayDto.holiday_name = createHolidayDto.holiday_name.trim();
        createHolidayDto.holiday_date = moment(
          createHolidayDto.holiday_date,
        ).format('YYYY-MM-DD');
        const data = await this.HolidaysModel.create(createHolidayDto);
        const successResponse = await createSuccessResponse(
          'Holiday created successfully',
          data,
          'HOLIDAY_CREATED',
        );
        return successResponse;
      } else {
        return {
          success: false,
          message: `Holiday is created already on ${createHolidayDto.holiday_date}`,
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

  async findAll(query: any) {
    try {
      // console.log('find all');
      const limit = query.limit || 5;
      const skip = query.skip || 0;
      const today = new Date();
      const length = await this.HolidaysModel.find(
        query.keyword || query.future
          ? {
              holiday_name: query.keyword
                ? { $regex: query.keyword, $options: 'i' }
                : { $exists: true },
              holiday_date: query.future
                ? { $exists: true, $gte: today }
                : { $exists: true },
            }
          : {},
      ).count();
      const data = await this.HolidaysModel.find(
        query.keyword || query.future
          ? {
              holiday_name: query.keyword
                ? { $regex: query.keyword, $options: 'i' }
                : { $exists: true },
              holiday_date: query.future
                ? { $exists: true, $gte: today }
                : { $exists: true },
            }
          : {},
      )
        .limit(limit)
        .skip(skip)
        .sort({ holiday_date: query.createdAt ? -1 : 1 });
      // .sort({ holiday_date: { $gte: today } });
      const response = {
        totalHolidays: length,
        data: data,
      };
      const successResponse = await createSuccessResponse(
        'Holiday list',
        response,
        'HOLIDAY_LIST',
      );
      // console.log(successResponse);
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
  async downloadHolidays() {
    try {
      const data = await this.HolidaysModel.aggregate([
        {
          $match: {
            _id: { $exists: true },
          },
        },
      ]);
      if (data) {
        const filename = `${Date.now()}_holiday.csv`;
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
          'no holidays found',
          {},
          'NO_HOLIDAYS_FOUND',
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

  async findOne(id: string) {
    try {
      const data = await this.HolidaysModel.findById(id);
      const successResponse = await createSuccessResponse(
        'Holiday list',
        data,
        'HOLIDAY_LIST',
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

  async update(id: string, updateHolidayDto: UpdateHolidayDto) {
    try {
      const weekday = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];

      const d = new Date(updateHolidayDto.holiday_date);
      const day = weekday[d.getDay()];
      updateHolidayDto.holiday_day = day;
      const data = await this.HolidaysModel.findByIdAndUpdate(
        id,
        updateHolidayDto,
      );
      const successResponse = await createSuccessResponse(
        'Holiday updated successfully',
        data,
        'HOLIDAY_UPDATED',
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
      const data = await this.HolidaysModel.findByIdAndDelete(id);
      const successResponse = await createSuccessResponse(
        'Holiday deleted successfully',
        data,
        'HOLIDAY_DELETED',
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
