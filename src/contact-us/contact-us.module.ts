import { Module } from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { ContactUsController } from './contact-us.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactUsSchema } from 'src/schemas/contact.us.schema';
import { ContactUs } from './entities/contact-us.entity';
import { Users, UsersSchema } from 'src/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContactUs.name, schema: ContactUsSchema },
      { name: Users.name, schema: UsersSchema },
    ]),
  ],
  controllers: [ContactUsController],
  providers: [ContactUsService],
})
export class ContactUsModule {}
