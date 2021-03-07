import { Controller, Get } from '@nestjs/common';
import { AqiService } from './aqi.service';
import { ISensorReading } from './aqiSensor';

@Controller('aqi')
export class AqiController {
  constructor(private aqiService: AqiService) {}

  @Get()
  getAqi(): ISensorReading {
    return this.aqiService.getAqi();
  }
}
