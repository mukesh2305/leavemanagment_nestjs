import { Module } from '@nestjs/common';
import { EducationService } from './education.service';
import { EducationController } from './education.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Education } from 'src/schemas/education.schema';
import { EducationSchema } from 'src/schemas/education.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Education.name, schema: EducationSchema },
    ]),
  ],
  controllers: [EducationController],
  providers: [EducationService],
})
export class EducationModule {}
