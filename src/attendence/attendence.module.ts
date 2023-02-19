import { Module } from '@nestjs/common';
import { AttendenceService } from './attendence.service';
import { AttendenceController } from './attendence.controller';
import { Report, ReportSchema } from 'src/schemas/report.schema';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { jwtConstants } from 'src/auth/constants';
import { Users, UsersSchema } from 'src/schemas/user.schema';
import { AttendenceSchema, Attendence } from 'src/schemas/attendence.schema';
import {
  NotificationSchema,
  Notification,
} from 'src/schemas/notification.schema';
import { Holidays, HolidaySchema } from 'src/schemas/holiday.schema';
import { Leaves, LeavesSchema } from 'src/schemas/leave.schema';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '7d' },
    }),
    MongooseModule.forFeature([
      { name: Users.name, schema: UsersSchema },
      { name: Report.name, schema: ReportSchema },
      { name: Attendence.name, schema: AttendenceSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Holidays.name, schema: HolidaySchema },
      { name: Leaves.name, schema: LeavesSchema },
    ]),
  ],
  controllers: [AttendenceController],
  providers: [AttendenceService],
})
export class AttendenceModule {}
