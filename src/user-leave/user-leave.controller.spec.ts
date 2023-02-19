import { Test, TestingModule } from '@nestjs/testing';
import { UserLeaveController } from './user-leave.controller';
import { UserLeaveService } from './user-leave.service';

describe('UserLeaveController', () => {
  let controller: UserLeaveController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserLeaveController],
      providers: [UserLeaveService],
    }).compile();

    controller = module.get<UserLeaveController>(UserLeaveController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
