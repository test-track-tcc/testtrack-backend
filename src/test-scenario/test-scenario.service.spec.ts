import { Test, TestingModule } from '@nestjs/testing';
import { TestScenarioService } from './test-scenario.service';

describe('TestScenarioService', () => {
  let service: TestScenarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestScenarioService],
    }).compile();

    service = module.get<TestScenarioService>(TestScenarioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
