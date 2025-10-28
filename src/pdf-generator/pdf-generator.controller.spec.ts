import { Test, TestingModule } from '@nestjs/testing';
import { PdfGeneratorController } from './pdf-generator.controller';

describe('PdfGeneratorController', () => {
  let controller: PdfGeneratorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PdfGeneratorController],
    }).compile();

    controller = module.get<PdfGeneratorController>(PdfGeneratorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
