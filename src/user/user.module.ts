import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, UsersSchema } from '../schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constants';
import { ConfigModule } from '@nestjs/config';
import { MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { authMiddleware } from 'src/middleware/auth.middleware';
import { RoleModule } from 'src/role/role.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { Department, DepartmentSchema } from 'src/schemas/department.schema';
import { DepartmentModule } from 'src/department/department.module';
import { RoleSchema } from 'src/schemas/role.schema';
import { UserLeaveService } from 'src/user-leave/user-leave.service';
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
// import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    RoleModule,
    forwardRef(() => DepartmentModule),
    forwardRef(() => LeaveModule),
    // ConfigModule.forRoot(),
    ConfigModule,
    UserLeaveModule,
    forwardRef(() => CategoryLeaveModule),
    MongooseModule.forFeature([
      { name: Users.name, schema: UsersSchema },
      { name: Leaves.name, schema: LeavesSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: Unique.name, schema: UniqueSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: 'Roles', schema: RoleSchema },
      { name: 'UserLeave', schema: UserLeaveSchema },
      { name: LeaveType.name, schema: MyLeaveSchema },
      { name: Designation.name, schema: DesignationSchema },
    ]),
    // forwardRef(() => DepartmentModule),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(authMiddleware)
      .exclude(
        { path: 'users/forgot-password', method: RequestMethod.ALL },
        { path: 'users/reset-password/:token', method: RequestMethod.ALL },
      )
      .forRoutes(
        { path: 'users', method: RequestMethod.ALL },
        { path: 'users/*', method: RequestMethod.ALL },
        { path: 'attendence', method: RequestMethod.ALL },
        { path: 'attendence/*', method: RequestMethod.ALL },
        { path: 'designation', method: RequestMethod.ALL },
        { path: 'designation/*', method: RequestMethod.ALL },
        { path: 'contact-us', method: RequestMethod.ALL },
        { path: 'contact-us/*', method: RequestMethod.ALL },
        { path: 'document', method: RequestMethod.ALL },
        { path: 'document/*', method: RequestMethod.ALL },
        { path: 'general-rules', method: RequestMethod.ALL },
        { path: 'general-rules/*', method: RequestMethod.ALL },
        { path: 'family', method: RequestMethod.ALL },
        { path: 'family/*', method: RequestMethod.ALL },
        { path: 'education', method: RequestMethod.ALL },
        { path: 'education/*', method: RequestMethod.ALL },
        { path: 'user-leave', method: RequestMethod.ALL },
        { path: 'user-leave/*', method: RequestMethod.ALL },
        { path: 'notification', method: RequestMethod.ALL },
        { path: 'notification/*', method: RequestMethod.ALL },
        { path: 'emergency-contacts', method: RequestMethod.ALL },
        { path: 'emergency-contacts/*', method: RequestMethod.ALL },
      );
  }
}
