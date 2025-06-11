import { Test, TestingModule } from '@nestjs/testing';
import { TestCasesService } from './test-case.service';

describe('TestCaseService', () => {
  let service: TestCasesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestCasesService],
    }).compile();

    service = module.get<TestCasesService>(TestCasesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
