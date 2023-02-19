import { Test, TestingModule } from '@nestjs/testing';
import { EmergencyContactsController } from './emergency-contacts.controller';
import { EmergencyContactsService } from './emergency-contacts.service';

describe('EmergencyContactsController', () => {
  let controller: EmergencyContactsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmergencyContactsController],
      providers: [EmergencyContactsService],
    }).compile();

    controller = module.get<EmergencyContactsController>(EmergencyContactsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
