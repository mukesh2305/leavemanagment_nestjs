import { Test, TestingModule } from '@nestjs/testing';
import { CategoryLeaveService } from './category-leave.service';

describe('CategoryLeaveService', () => {
  let service: CategoryLeaveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryLeaveService],
    }).compile();

    service = module.get<CategoryLeaveService>(CategoryLeaveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
