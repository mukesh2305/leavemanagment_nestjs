import { Module } from '@nestjs/common';
import { TimesheetService } from './timesheet.service';
import { TimesheetController } from './timesheet.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TimesheetSchema, Timesheet } from 'src/schemas/timesheet.schema';
import { UsersSchema, Users } from 'src/schemas/user.schema';
import { Project, ProjectSchema } from 'src/schemas/project.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Timesheet.name, schema: TimesheetSchema },
      { name: Users.name, schema: UsersSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
  ],
  controllers: [TimesheetController],
  providers: [TimesheetService],
})
export class TimesheetModule {}
