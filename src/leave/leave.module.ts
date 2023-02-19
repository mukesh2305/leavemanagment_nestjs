import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { LeavesSchema, Leaves } from 'src/schemas/leave.schema';
import { Users, UsersSchema } from 'src/schemas/user.schema';
import { Holidays, HolidaySchema } from 'src/schemas/holiday.schema';
import { UserLeaveSchema } from '../schemas/user.leave.schema';
import { NotificationModule } from 'src/notification/notification.module';
import {
  Notification,
  NotificationSchema,
} from 'src/schemas/notification.schema';
import { authMiddleware } from 'src/middleware/auth.middleware';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constants';
import { UserModule } from 'src/user/user.module';
import { RoleModule } from 'src/role/role.module';
import { LeaveType, MyLeaveSchema } from 'src/schemas/category.leave.schema';

@Module({
  imports: [
    NotificationModule,
    forwardRef(() => UserModule),
    RoleModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '7d' },
    }),
    MongooseModule.forFeature([
      { name: Leaves.name, schema: LeavesSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: LeaveType.name, schema: MyLeaveSchema },
      { name: Users.name, schema: UsersSchema },
      { name: Holidays.name, schema: HolidaySchema },
      { name: 'UserLeave', schema: UserLeaveSchema },
    ]),
  ],
  controllers: [LeaveController],
  providers: [LeaveService],
})
export class LeaveModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(authMiddleware)
      .forRoutes(
        { path: 'leave', method: RequestMethod.ALL },
        { path: 'leave/*', method: RequestMethod.ALL },
      );
  }
}
