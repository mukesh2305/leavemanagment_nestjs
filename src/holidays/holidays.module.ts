import { forwardRef, Module } from '@nestjs/common';
import { HolidaysService } from './holidays.service';
import { HolidaysController } from './holidays.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Holidays, HolidaySchema } from '../schemas/holiday.schema';
import { MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { authMiddleware } from '../middleware/auth.middleware';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { UsersSchema, Users } from 'src/schemas/user.schema';
import { RoleModule } from 'src/role/role.module';
import { DepartmentModule } from 'src/department/department.module';
import { Department, DepartmentSchema } from 'src/schemas/department.schema';
import { RoleSchema } from 'src/schemas/role.schema';
import { UserLeaveModule } from 'src/user-leave/user-leave.module';
import { UserLeaveSchema } from 'src/schemas/user.leave.schema';
import { CategoryLeaveModule } from 'src/category-leave/category-leave.module';
import { LeaveType, MyLeaveSchema } from 'src/schemas/category.leave.schema';
import { Leaves, LeavesSchema } from 'src/schemas/leave.schema';
import { LeaveModule } from 'src/leave/leave.module';
import { Designation, DesignationSchema } from 'src/schemas/designation.schema';
import { Unique, UniqueSchema } from 'src/schemas/unique.schema';
import {
  NotificationSchema,
  Notification,
} from 'src/schemas/notification.schema';

@Module({
  imports: [
    UserModule,
    LeaveModule,
    // RoleModule,
    DepartmentModule,
    forwardRef(() => UserLeaveModule),
    forwardRef(() => CategoryLeaveModule),
    MongooseModule.forFeature([
      { name: Holidays.name, schema: HolidaySchema },
      { name: Leaves.name, schema: LeavesSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: Users.name, schema: UsersSchema },
      { name: Unique.name, schema: UniqueSchema },
      { name: 'Roles', schema: RoleSchema },
      { name: 'UserLeave', schema: UserLeaveSchema },
      { name: LeaveType.name, schema: MyLeaveSchema },
      { name: Designation.name, schema: DesignationSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '7d' },
    }),
    RoleModule,
  ],
  controllers: [HolidaysController],
  providers: [HolidaysService, UserService],
})
export class HolidaysModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(authMiddleware)
      .forRoutes(
        { path: 'holidays', method: RequestMethod.ALL },
        { path: 'holidays/*', method: RequestMethod.ALL },
      );
  }
}
