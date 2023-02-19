import { Module } from '@nestjs/common';
import { TicketingService } from './ticketing.service';
import { TicketingController } from './ticketing.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Ticket, TicketSchema } from 'src/schemas/ticket.schema';
import { Users, UsersSchema } from 'src/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ticket.name, schema: TicketSchema },
      { name: Users.name, schema: UsersSchema },
    ]),
  ],
  controllers: [TicketingController],
  providers: [TicketingService],
})
export class TicketingModule {}
