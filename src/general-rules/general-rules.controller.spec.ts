import { Test, TestingModule } from '@nestjs/testing';
import { GeneralRulesController } from './general-rules.controller';
import { GeneralRulesService } from './general-rules.service';

describe('GeneralRulesController', () => {
  let controller: GeneralRulesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeneralRulesController],
      providers: [GeneralRulesService],
    }).compile();

    controller = module.get<GeneralRulesController>(GeneralRulesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
