import { Module } from '@nestjs/common';
import { GeneralRulesService } from './general-rules.service';
import { GeneralRulesController } from './general-rules.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { GeneralRuleSchema } from 'src/schemas/general.rules.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'GeneralRule', schema: GeneralRuleSchema },
    ]),
  ],
  controllers: [GeneralRulesController],
  providers: [GeneralRulesService],
})
export class GeneralRulesModule {}
