import { Module } from '@nestjs/common';
import { FamilyService } from './family.service';
import { FamilyController } from './family.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Family, FamilySchema } from 'src/schemas/family.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Family.name, schema: FamilySchema }]),
  ],
  controllers: [FamilyController],
  providers: [FamilyService],
})
export class FamilyModule {}
