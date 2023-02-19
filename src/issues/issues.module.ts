import { Module } from '@nestjs/common';
import { IssuesService } from './issues.service';
import { IssuesController } from './issues.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Issues, IssuesSchema } from 'src/schemas/issues.schema';
import { Ticket, TicketSchema } from 'src/schemas/ticket.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Issues.name, schema: IssuesSchema },
      { name: Ticket.name, schema: TicketSchema },
    ]),
  ],
  controllers: [IssuesController],
  providers: [IssuesService],
})
export class IssuesModule {}
