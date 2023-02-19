import { Module } from '@nestjs/common';
import { DesignationService } from './designation.service';
import { DesignationController } from './designation.controller';
import { Designation, DesignationSchema } from 'src/schemas/designation.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Department, DepartmentSchema } from 'src/schemas/department.schema';
import { Users, UsersSchema } from 'src/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Designation.name, schema: DesignationSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: Users.name, schema: UsersSchema },
    ]),
  ],
  controllers: [DesignationController],
  providers: [DesignationService],
})
export class DesignationModule {}
