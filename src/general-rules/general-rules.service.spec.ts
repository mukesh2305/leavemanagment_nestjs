import { Test, TestingModule } from '@nestjs/testing';
import { GeneralRulesService } from './general-rules.service';

describe('GeneralRulesService', () => {
  let service: GeneralRulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeneralRulesService],
    }).compile();

    service = module.get<GeneralRulesService>(GeneralRulesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
