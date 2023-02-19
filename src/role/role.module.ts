import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Roles, RoleSchema } from 'src/schemas/role.schema';
import { Users, UsersSchema } from 'src/schemas/user.schema';
import { authMiddleware } from 'src/middleware/auth.middleware';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constants';
import { UserModule } from 'src/user/user.module';
// import { RoleModule } from 'src/role/role.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Roles', schema: RoleSchema },
      { name: Users.name, schema: UsersSchema },
    ]),
    forwardRef(() => UserModule),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(authMiddleware)
      .forRoutes(
        { path: 'role/*', method: RequestMethod.ALL },
        { path: 'role', method: RequestMethod.ALL },
      );
  }
}
