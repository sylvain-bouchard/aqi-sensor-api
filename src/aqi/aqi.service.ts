import { Injectable } from '@nestjs/common';
import { AqiSensor, ISensorReading } from './aqiSensor';
import { EventEmitter } from 'events';

@Injectable()
export class AqiService extends EventEmitter {
  private _sensorInterface: AqiSensor;

  constructor() {
    super();

    const sensorDevice = '/dev/ttyUSB0';

    try {
      this._sensorInterface = new AqiSensor(sensorDevice, 9600, 2);
    } catch (error) {
      // tslint:disable-next-line: no-console
      console.log(
        'AQI sensor device not available. This service will not be activated.',
      );
      return;
    }

    this._sensorInterface.on('reading', data => {
      this.emit('reading', data);
    });
  }

  getAqi(): ISensorReading {
    return this._sensorInterface.lastReading;
  }
}
