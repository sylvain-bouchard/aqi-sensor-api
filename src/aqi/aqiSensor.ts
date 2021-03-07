import * as SerialPort from 'serialport';
import * as fs from 'fs';
import { EventEmitter } from 'events';

export interface ISensorReading {
  pm25: number;
  pm10: number;
  id: number;
  checksum: number;
}

export class AqiSensor extends EventEmitter {
  private static HEAD = 0xaa;
  private static TAIL = 0xab;
  private static CMD_ID = 0xb4;
  private static READ = 0x00;
  private static WRITE = 0x01;
  private static QUERY_CMD = 0x04;
  private static REPORT_MODE_CMD = 0x02;
  private static ACTIVE_MODE = 0x00;
  private static PASSIVE_MODE = 0x01;

  private _serialPort: SerialPort;
  private _lastReading: ISensorReading;

  constructor(
    private path: string,
    private baudRate: number,
    private timeout: number,
  ) {
    super();

    // Check if device is connected
    if (!fs.existsSync(path)) {
      throw new Error('Device not connected!');
    }

    this._serialPort = new SerialPort(path, { baudRate });
    this._serialPort.on('data', data => {
      this._lastReading = this.processFrame(data);

      this.emit('reading', this.lastReading);
    });
  }

  public get lastReading(): ISensorReading {
    return this._lastReading;
  }

  public query(): ISensorReading {
    const initialPart = this.beginCommand();
    const dataByte1 = Buffer.from([AqiSensor.QUERY_CMD]);
    const padding = Buffer.from(Array(12).fill(0x00));

    let command = Buffer.concat([initialPart, dataByte1, padding]);
    command = this.finishCommand(command);

    this.executeCommand(command);

    // Wait for and ready reply
    const replyFrame = this.getReply();
    return this.processFrame(replyFrame);
  }

  public setReportMode(read: boolean, active: boolean) {
    const reportModeCommand = AqiSensor.REPORT_MODE_CMD;
    const readOrWriteMode = read ? AqiSensor.READ : AqiSensor.WRITE;
    const activeOrPassiveMode = active
      ? AqiSensor.ACTIVE_MODE
      : AqiSensor.PASSIVE_MODE;
    const padding = Buffer.from(Array(10).fill(0x00));

    const initialPart = this.beginCommand();
    let command = Buffer.from([
      reportModeCommand,
      readOrWriteMode,
      activeOrPassiveMode,
    ]);

    command = Buffer.concat([initialPart, command, padding]);
    command = this.finishCommand(command);

    this.executeCommand(command);
  }

  /**
   * Reads sensor data.
   *
   * @return: PM2.5 and PM10 concentration in micrograms per cube meter.
   */
  public read(): ISensorReading {
    let data: ISensorReading;
    let frame: Buffer;
    do {
      frame = this._serialPort.read(10) as Buffer;
      if (frame[0] === AqiSensor.HEAD) {
        data = this.processFrame(frame);
      }
    } while (frame[0] !== AqiSensor.HEAD);
    return data;
  }

  private processFrame(frame: Buffer): ISensorReading {
    // Validate that last byte is tail
    if (frame.slice(-1)[0] !== AqiSensor.TAIL) {
      throw new Error('No tail found in the input buffer!');
    }

    // Byte positions:
    // 0 - Header
    // 1 - Command No.
    // 2,3 - PM2.5 low/high byte
    // 4,5 - PM10 low/high
    // 6,7 - ID bytes
    // 8 - Checksum - sum of bytes 2-7
    // 9 - Tail`
    const sensorReading: ISensorReading = {
      pm25: frame.readUInt16LE(2) / 10.0,
      pm10: frame.readUInt16LE(4) / 10.0,
      id: frame.readUInt16LE(6),
      checksum: frame.readUInt8(8),
    };

    // Validate checksum
    const checksum = this.computeChecksum(frame.slice(2, 8));
    if (checksum !== sensorReading.checksum) {
      throw new Error(`Checksum verification failed!`);
    }
    return sensorReading;
  }

  private computeChecksum(data: Buffer) {
    const sum = data.reduce((a, b) => {
      return a + b;
    });
    return sum % 256;
  }

  private getReply(): Buffer {
    const raw = this._serialPort.read(10) as Buffer;
    if (!raw) {
      return;
    }
    const data = raw.slice(2, 8);
    if (data.length === 0) {
      return;
    }
    return raw;
  }

  private beginCommand(): Buffer {
    return Buffer.from([AqiSensor.HEAD, AqiSensor.CMD_ID]);
  }

  private finishCommand(command: Buffer): Buffer {
    const deviceId = Buffer.from([0xff, 0xff]);
    const newCommand = Buffer.concat([command, deviceId]);
    const checksum = this.computeChecksum(newCommand);
    const endPart = Buffer.from([checksum, AqiSensor.TAIL]);

    return Buffer.concat([newCommand, endPart]);
  }

  private executeCommand(command: Buffer) {
    this._serialPort.write(command);
  }
}
