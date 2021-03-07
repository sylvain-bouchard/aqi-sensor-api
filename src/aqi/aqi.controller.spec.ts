import { Test, TestingModule } from '@nestjs/testing';
import { AqiController } from './aqi.controller';

describe('Aqi Controller', () => {
  let controller: AqiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AqiController],
    }).compile();

    controller = module.get<AqiController>(AqiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
