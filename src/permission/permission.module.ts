import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Permission, PermissionSchema } from 'src/schemas/permission.schema';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constants';
import { authMiddleware } from 'src/middleware/auth.middleware';
import { RoleModule } from 'src/role/role.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Permission', schema: PermissionSchema },
    ]),
    UserModule,
    RoleModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [PermissionController],
  providers: [PermissionService],
})
export class PermissionModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(authMiddleware).forRoutes(
      { path: 'permission/*', method: RequestMethod.ALL },
      // { path: 'permission', method: RequestMethod.ALL },
    );
  }
}
