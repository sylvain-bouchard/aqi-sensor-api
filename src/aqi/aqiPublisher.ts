import { Injectable } from '@nestjs/common';
import { AqiService } from './aqi.service';
import { ISensorReading } from './aqiSensor';
import { EventService } from '../event/event.service';

import * as os from 'os';

@Injectable()
export class AqiPublisher {
  private _started: boolean = false;

  constructor(
    private readonly aqiService: AqiService,
    private readonly eventService: EventService,
  ) {
    aqiService.on('reading', data => {
      this.publish(data);
    });
  }

  public start() {
    this._started = true;

    // tslint:disable-next-line: no-console
    console.log('AqiPublisher started successfully!');
  }

  public publish(sensorData: ISensorReading) {
    if (this._started) {
      // Add source and type of event
      const event = {
        source: this.getLocalIPAddress(),
        type: 'aqi',
        data: sensorData,
      };
      console.log(`Publishing event ${JSON.stringify(event)}`);
      this.eventService.publish('aqi', Buffer.from(JSON.stringify(event)));
    }
  }

  public getLocalIPAddress(): string {
    const networkInterfaces: any = os.networkInterfaces();
    const validInterfaces = Object.keys(networkInterfaces).filter(
      index => index !== 'lo',
    );
    const defaultInterface = networkInterfaces[validInterfaces[0]].filter(
      obj => obj.family === 'IPv4',
    )[0];

    return defaultInterface.address;
  }
}
