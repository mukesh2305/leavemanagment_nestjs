import { forwardRef, Module } from '@nestjs/common';
import { UserLeaveService } from './user-leave.service';
import { UserLeaveController } from './user-leave.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserLeaveSchema } from '../schemas/user.leave.schema';
import { Leaves, LeavesSchema } from 'src/schemas/leave.schema';
import { UserModule } from 'src/user/user.module';
import { UsersSchema, Users } from 'src/schemas/user.schema';
import {
  NotificationSchema,
  Notification,
} from 'src/schemas/notification.schema';
import { LeaveType, MyLeaveSchema } from 'src/schemas/category.leave.schema';
import { CategoryLeaveModule } from 'src/category-leave/category-leave.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => CategoryLeaveModule),
    MongooseModule.forFeature([
      { name: 'UserLeave', schema: UserLeaveSchema },
      { name: Leaves.name, schema: LeavesSchema },
      { name: Users.name, schema: UsersSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: LeaveType.name, schema: MyLeaveSchema },
    ]),
  ],
  controllers: [UserLeaveController],
  providers: [UserLeaveService],
  exports: [UserLeaveService],
})
export class UserLeaveModule {}
