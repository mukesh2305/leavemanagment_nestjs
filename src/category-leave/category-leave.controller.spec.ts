import { Test, TestingModule } from '@nestjs/testing';
import { CategoryLeaveController } from './category-leave.controller';
import { CategoryLeaveService } from './category-leave.service';

describe('CategoryLeaveController', () => {
  let controller: CategoryLeaveController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryLeaveController],
      providers: [CategoryLeaveService],
    }).compile();

    controller = module.get<CategoryLeaveController>(CategoryLeaveController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
