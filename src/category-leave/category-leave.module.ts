import {
  Module,
  RequestMethod,
  MiddlewareConsumer,
  forwardRef,
} from '@nestjs/common';
import { CategoryLeaveService } from './category-leave.service';
import { CategoryLeaveController } from './category-leave.controller';
import { LeaveType, MyLeaveSchema } from 'src/schemas/category.leave.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from 'src/user/user.module';
import { UsersSchema, Users } from 'src/schemas/user.schema';
import { jwtConstants } from 'src/auth/constants';
import { JwtModule } from '@nestjs/jwt';

import { authMiddleware } from 'src/middleware/auth.middleware';
import { RoleModule } from 'src/role/role.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    MongooseModule.forFeature([
      { name: LeaveType.name, schema: MyLeaveSchema },
      { name: Users.name, schema: UsersSchema },
    ]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '7d' },
    }),
    RoleModule,
  ],
  controllers: [CategoryLeaveController],
  providers: [CategoryLeaveService],
})
export class CategoryLeaveModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(authMiddleware)
      .forRoutes(
        { path: 'category-leave', method: RequestMethod.ALL },
        { path: 'category-leave/*', method: RequestMethod.ALL },
      );
  }
}
