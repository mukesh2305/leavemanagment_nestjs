import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { GeneralRulesModule } from './general-rules/general-rules.module';
import { EmergencyContactsModule } from './emergency-contacts/emergency-contacts.module';
import { ContactUsModule } from './contact-us/contact-us.module';
import { FamilyModule } from './family/family.module';
import { EducationModule } from './education/education.module';

import { NotificationModule } from './notification/notification.module';
import { DocumentModule } from './document/document.module';
import { MongooseModule } from '@nestjs/mongoose';

import { HolidaysModule } from './holidays/holidays.module';
import { CategoryLeaveModule } from './category-leave/category-leave.module';
import { RoleModule } from './role/role.module';
import { DepartmentModule } from './department/department.module';
import { PermissionModule } from './permission/permission.module';
import { UserLeaveModule } from './user-leave/user-leave.module';
import { UserModule } from './user/user.module';
import { LeaveModule } from './leave/leave.module';
import { JwtMiddleware } from './middleware/jwt.middleware';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth/constants';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { Users, UsersSchema } from './schemas/user.schema';
import { LoggerMiddleware } from './middleware/log.middleware';
import { GoogleStrategy } from './middleware/google.auth.middleware';
import { DesignationModule } from './designation/designation.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AttendenceModule } from './attendence/attendence.module';
// import { ReportModule } from './report/report.module';
import { ProjectsModule } from './projects/projects.module';
import { TimesheetModule } from './timesheet/timesheet.module';
import { IssuesModule } from './issues/issues.module';
import { TicketingModule } from './ticketing/ticketing.module';
import { CommandModule } from 'nestjs-command';
// import { UserCommand } from './seeder/seeder.command';
// import { SeederService } from './seeder/seeder.service';

@Module({
  //MongooseModule.forRoot('mongodb+srv://abcdefg:abcdefg@cluster0.vffsk.mongodb.net/LeaveManagement?retryWrites=true&w=majority'),
  imports: [
    ServeStaticModule.forRoot({
      rootPath: './uploads',
    }),
    MongooseModule.forFeature([{ name: Users.name, schema: UsersSchema }]),
    ConfigModule.forRoot({ isGlobal: true }),
    LeaveModule,
    HolidaysModule,
    MongooseModule.forRoot(process.env.DB_URL),
    ScheduleModule.forRoot(),
    CategoryLeaveModule,
    RoleModule,
    DepartmentModule,
    PermissionModule,
    UserLeaveModule,
    UserModule,
    ConfigModule,
    CommandModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '7d' },
    }),
    DocumentModule,
    NotificationModule,
    EducationModule,
    FamilyModule,
    ContactUsModule,
    EmergencyContactsModule,
    GeneralRulesModule,
    DesignationModule,
    AttendenceModule,
    ProjectsModule,
    TimesheetModule,
    IssuesModule,
    TicketingModule,
    // ReportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
    consumer
      .apply(JwtMiddleware)
      .forRoutes({ path: '/userlogin', method: RequestMethod.POST });
    consumer
      .apply(GoogleStrategy)
      .forRoutes({ path: '/googlelogin', method: RequestMethod.POST });
  }
}
