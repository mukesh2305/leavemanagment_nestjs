import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Department, DepartmentSchema } from 'src/schemas/department.schema';
import { Users, UsersSchema } from '../schemas/user.schema';
import { authMiddleware } from 'src/middleware/auth.middleware';
import { UserModule } from 'src/user/user.module';
import { RoleModule } from 'src/role/role.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constants';
import { Designation, DesignationSchema } from 'src/schemas/designation.schema';

@Module({
  imports: [
    forwardRef(() => UserModule),
    RoleModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '7d' },
    }),
    MongooseModule.forFeature([
      { name: Department.name, schema: DepartmentSchema },
      { name: Users.name, schema: UsersSchema },
      { name: Designation.name, schema: DesignationSchema },
    ]),
  ],
  controllers: [DepartmentController],
  providers: [DepartmentService],
  exports: [DepartmentService],
})
export class DepartmentModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(authMiddleware)
      .forRoutes(
        { path: 'department', method: RequestMethod.ALL },
        { path: 'department/*', method: RequestMethod.ALL },
      );
  }
}
