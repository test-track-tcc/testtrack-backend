import { Test, TestingModule } from '@nestjs/testing';
import { AccessGroupService } from './access-group.service';

describe('AccessGroupService', () => {
  let service: AccessGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccessGroupService],
    }).compile();

    service = module.get<AccessGroupService>(AccessGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
