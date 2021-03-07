import { Injectable } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { ConfigService } from '../config/config.service';

@Injectable()
export class EventService {
  private client: any;

  constructor(private configService: ConfigService) {}

  public async publish(topic: string, content: Buffer) {
    await this.setUp();
    this.client.publish(topic, content);
  }

  public async setUp() {
    if (this.client) {
      return;
    }
    const mqttHost = this.configService.get('MQTT_HOST');
    console.log(`Attempting to connect to MQTT broker @ ${mqttHost}`);

    this.client = mqtt.connect(mqttHost);
    this.client.on('connect', () => {
      // tslint:disable-next-line: no-console
      console.log('Successfully connected to MQTT broker!');
    });
    this.client.on('error', error => {
      console.error(error);
    });
  }

  public async subscribe(topic: string, eventHandler: any) {
    await this.setUp();
    this.client.subscribe(topic);
    this.client.on('message', (t, m) => {
      if (topic === t) {
        eventHandler(m);
      }
    });
  }
}
