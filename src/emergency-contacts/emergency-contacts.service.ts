import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EmergencyContactsDocument } from 'src/schemas/emergency.contact.schema';
import { EmergencyContactsDto } from './dto/create-emergency-contact.dto';
import { UpdateEmergencyContactDto } from './dto/update-emergency-contact.dto';
import { Model } from 'mongoose';
import { createSuccessResponse } from 'src/helper/success.helper';
import { ErrorLog } from 'src/helper/error.helper';

@Injectable()
export class EmergencyContactsService {
  constructor(
    @InjectModel('EmergencyContacts')
    private emergencyContactsModel: Model<EmergencyContactsDocument>,
  ) {}

  async create(EmergencyContactsDto: EmergencyContactsDto) {
    try {
      const data = await this.emergencyContactsModel.create(
        EmergencyContactsDto,
      );
      const successResponse = await createSuccessResponse(
        'EmergencyContacts created successfully',
        data,
        'EMERGENCY_CONTACTS_CREATED_SUCCESSFULLY',
      );
      return successResponse;
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        message: 'something went wrong',
        error: error.message,
      };
    }
  }
  async findOneForPermit(id: string) {
    return await this.emergencyContactsModel.findById(id);
  }

  async findAll(id: string) {
    try {
      const data = await this.emergencyContactsModel.find({ userId: id });
      const successResponse = await createSuccessResponse(
        'EmergencyContacts fetched successfully',
        data,
        'EMERGENCY_CONTACTS_FETCHED_SUCCESSFULLY',
      );
      return successResponse;
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        message: 'something went wrong',
        error: error.message,
      };
    }
  }

  async findOne(id: string) {
    return `This action returns a #${id} emergencyContact`;
  }

  async update(
    id: string,
    updateEmergencyContactDto: UpdateEmergencyContactDto,
  ) {
    try {
      const data = await this.emergencyContactsModel.findByIdAndUpdate(
        id,
        updateEmergencyContactDto,
        { new: true },
      );
      const successResponse = await createSuccessResponse(
        'EmergencyContacts updated successfully',
        data,
        'EMERGENCY_CONTACTS_UPDATED_SUCCESSFULLY',
      );
      return successResponse;
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        message: 'something went wrong',
        error: error.message,
      };
    }
  }

  async remove(id: string) {
    try {
      const data = await this.emergencyContactsModel.findByIdAndRemove(id);
      const successResponse = await createSuccessResponse(
        'EmergencyContacts deleted successfully',
        data,
        'EMERGENCY_CONTACTS_DELETED_SUCCESSFULLY',
      );
      return successResponse;
    } catch (error) {
      console.log(error);
      ErrorLog(error);
      return {
        status: false,
        message: 'something went wrong',
        error: error.message,
      };
    }
  }
}
