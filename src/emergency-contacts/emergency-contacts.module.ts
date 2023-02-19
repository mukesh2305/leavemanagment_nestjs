import { Module } from '@nestjs/common';
import { EmergencyContactsService } from './emergency-contacts.service';
import { EmergencyContactsController } from './emergency-contacts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EmergencyContactsSchema } from 'src/schemas/emergency.contact.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'EmergencyContacts', schema: EmergencyContactsSchema },
    ]),
  ],
  controllers: [EmergencyContactsController],
  providers: [EmergencyContactsService],
})
export class EmergencyContactsModule {}
