import { seeder } from 'nestjs-seeder';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, UsersSchema } from './schemas/user.schema';
import { UsersSeeder, UniqueSeeder } from './seeder/seeder.service';
import { Unique, UniqueSchema } from './schemas/unique.schema';
import 'dotenv/config';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth/constants';
import { RoleSchema, Roles } from './schemas/role.schema';
import { Project, ProjectSchema } from './schemas/project.schema';
import { LeaveType, MyLeaveSchema } from './schemas/category.leave.schema';

seeder({
  imports: [
    MongooseModule.forRoot(process.env.DB_URL),
    MongooseModule.forFeature([
      { name: Users.name, schema: UsersSchema },
      { name: Unique.name, schema: UniqueSchema },
      { name: Roles.name, schema: RoleSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: LeaveType.name, schema: MyLeaveSchema },
    ]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '7d' },
    }),
  ],
}).run([UniqueSeeder, UsersSeeder]);
