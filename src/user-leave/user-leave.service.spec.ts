import { Test, TestingModule } from '@nestjs/testing';
import { UserLeaveService } from './user-leave.service';

describe('UserLeaveService', () => {
  let service: UserLeaveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserLeaveService],
    }).compile();

    service = module.get<UserLeaveService>(UserLeaveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
