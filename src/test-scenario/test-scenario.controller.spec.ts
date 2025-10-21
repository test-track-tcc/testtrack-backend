import { Test, TestingModule } from '@nestjs/testing';
import { TestScenarioController } from './test-scenario.controller';

describe('TestScenarioController', () => {
  let controller: TestScenarioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestScenarioController],
    }).compile();

    controller = module.get<TestScenarioController>(TestScenarioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
