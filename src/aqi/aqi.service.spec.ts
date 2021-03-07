import { Test, TestingModule } from '@nestjs/testing';
import { AqiService } from './aqi.service';

describe('AqiService', () => {
  let service: AqiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AqiService],
    }).compile();

    service = module.get<AqiService>(AqiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
